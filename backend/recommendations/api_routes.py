# api_routes.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from bodyshape import ClothingRecommender
from seasonalcolour import SeasonalColorRecommender  # Import the seasonal color logic
import traceback
import json

# Import the SeasonalColorRecommender
from seasonalcolour import SeasonalColorRecommender

router = APIRouter()

# Initialize the recommenders
recommender = ClothingRecommender('clothing_data.csv')  # Update with your actual data path
season_recommender = SeasonalColorRecommender('seasonalcolour.csv')  # Path to seasonal color data

class RecommendationRequest(BaseModel):
    body_shape: str
    occasion: Optional[str] = None
    season: Optional[str] = None

class RecommendationResponse(BaseModel):
    success: bool
    recommendations: Dict[str, str] = {}
    error: Optional[str] = None

class SeasonRequest(BaseModel):
    season: str

class SeasonResponse(BaseModel):
    season: str
    complementary_colors: List[str]
    color_combinations: List[str]

@router.get("/body-shapes/", response_model=List[str])
async def get_body_shapes():
    """Return all available body shapes from the recommender."""
    try:
        return recommender.get_body_shapes()
    except Exception as e:
        print(f"Error getting body shapes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/occasions/", response_model=List[str])
async def get_occasions():
    """Return all available occasions from the recommender."""
    try:
        return recommender.get_occasions()
    except Exception as e:
        print(f"Error getting occasions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/seasons/", response_model=List[str])
async def get_seasons():
    """Return all available seasons from the recommender."""
    try:
        # Using the original dataframe from the recommender
        seasons = sorted(season_recommender.original_df['Seasonal Colour'].unique().tolist())
        return seasons
    except Exception as e:
        print(f"Error getting seasons: {e}")
        # Return default seasons if there's an error
        return ["Spring", "Summer", "Autumn", "Winter"]

@router.post("/detect-body-shape/")
async def detect_body_shape(
    image: Optional[UploadFile] = File(None),
    shoulder: float = Form(...),
    bust: float = Form(...),
    waist: float = Form(...),
    hips: float = Form(...)
):
    """Detect body shape based on measurements and optional image."""
    try:
        # Calculate body shape based on measurements
        # This is a simplified example - replace with actual logic
        waist_to_hip = waist / hips
        shoulder_to_hip = shoulder / hips
        
        body_shape = "Unknown"
        
        if waist_to_hip <= 0.75 and shoulder_to_hip < 0.95:
            body_shape = "Pear"
        elif waist_to_hip <= 0.75 and shoulder_to_hip >= 0.95:
            body_shape = "Hourglass"
        elif waist_to_hip > 0.8 and shoulder_to_hip > 1.05:
            body_shape = "Inverted Triangle"
        elif waist_to_hip > 0.8 and shoulder_to_hip < 0.95:
            body_shape = "Apple"
        else:
            body_shape = "Rectangle"
        
        # If image was provided, you could refine the detection
        # This is where you'd integrate computer vision if available
        
        return {"body_shape": body_shape}
    except Exception as e:
        print(f"Error in detect_body_shape: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-season/")
async def detect_season(
    image: Optional[UploadFile] = File(None),
    eye_color: str = Form(...),
    hair_color: str = Form(...),
    skin_tone: str = Form(...)
):
    """Determine color season based on provided characteristics."""
    try:
        # Simple mapping logic - replace with more sophisticated algorithm
        eye_color = eye_color.lower()
        hair_color = hair_color.lower()
        skin_tone = skin_tone.lower()
        
        season = "Unknown"
        
        # Very simplified determination logic
        if ("blue" in eye_color or "green" in eye_color) and ("blonde" in hair_color or "golden" in hair_color):
            if "warm" in skin_tone or "golden" in skin_tone:
                season = "Spring"
            else:
                season = "Summer"
        elif ("brown" in eye_color or "hazel" in eye_color) and ("brown" in hair_color or "black" in hair_color):
            if "olive" in skin_tone or "warm" in skin_tone:
                season = "Autumn"
            else:
                season = "Winter"
        
        # Image processing would go here if implemented
        
        # Get recommendations for the detected season
        if season != "Unknown":
            season_recs = season_recommender.get_season_recommendations(season)
            if "error" not in season_recs:
                return {
                    "season": season,
                    "complementary_colors": season_recs["complementary_colors"],
                    "color_combinations": season_recs["color_combinations"]
                }
            else:
                print(f"Season recommendation error: {season_recs['error']}")
        
        # Return just the season if we couldn't get recommendations
        return {"season": season}
    except Exception as e:
        print(f"Error in detect_season: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/season-recommendations/", response_model=SeasonResponse)
async def get_season_recommendations(request: Request):
    """Get color recommendations for a specified season."""
    try:
        # Get the request body as JSON
        body = await request.json()
        season = body.get("season")
        
        if not season:
            raise HTTPException(status_code=400, detail="Season parameter is required")
        
        # Get recommendations for the season
        recommendations = season_recommender.get_season_recommendations(season)
        
        if "error" in recommendations:
            raise HTTPException(status_code=400, detail=recommendations["error"])
        
        return recommendations
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        print(f"Error in get_season_recommendations: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend/", response_model=RecommendationResponse)
async def get_recommendations(request: Request):
    """Generate clothing recommendations based on body shape, occasion, and season."""
    try:
        # Get the request body as JSON
        body = await request.json()
        print(f"Received request: {body}")
        
        # Extract parameters
        body_shape = body.get("body_shape")
        occasion = body.get("occasion")
        season = body.get("season")  # New parameter for seasonal color
        
        # Validate body_shape
        if not body_shape:
            return {"success": False, "error": "Body shape is required"}
        
        # Get base recommendations
        result = recommender.recommend(body_shape, occasion)
        
        # Add seasonal color recommendations if season is provided
        if season and result.get("success"):
            try:
                season_recs = season_recommender.get_season_recommendations(season)
                if "error" not in season_recs:
                    # Add complementary colors
                    if season_recs.get("complementary_colors"):
                        result["recommendations"]["Complementary Colors"] = ", ".join(
                            season_recs["complementary_colors"][:3]  # Limit to top 3 colors
                        )
                    
                    # Add color combinations
                    if season_recs.get("color_combinations"):
                        result["recommendations"]["Color Combinations"] = ", ".join(
                            season_recs["color_combinations"][:2]  # Limit to top 2 combinations
                        )
                else:
                    print(f"Error getting season recommendations: {season_recs['error']}")
            except Exception as se:
                print(f"Error processing seasonal recommendations: {se}")
                # Continue with base recommendations if seasonal fails
        
        return result
    except json.JSONDecodeError:
        print("Invalid JSON received")
        return {"success": False, "error": "Invalid JSON format"}
    except Exception as e:
        print(f"Error in get_recommendations: {e}")
        traceback.print_exc()
        return {"success": False, "error": str(e)}