# api_routes.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from bodyshape import ClothingRecommender
import traceback
import json

router = APIRouter()

# Initialize the recommender
recommender = ClothingRecommender('clothing_data.csv')  # Update with your actual data path

class RecommendationRequest(BaseModel):
    body_shape: str
    occasion: Optional[str] = None
    season: Optional[str] = None

class RecommendationResponse(BaseModel):
    success: bool
    recommendations: Dict[str, str] = {}
    error: Optional[str] = None

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
        
        return {"season": season}
    except Exception as e:
        print(f"Error in detect_season: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend/", response_model=RecommendationResponse)
async def get_recommendations(request: Request):
    """Generate clothing recommendations based on body shape and optional occasion."""
    try:
        # Get the request body as JSON
        body = await request.json()
        print(f"Received request: {body}")
        
        # Extract parameters
        body_shape = body.get("body_shape")
        occasion = body.get("occasion")
        
        # Validate body_shape
        if not body_shape:
            return {"success": False, "error": "Body shape is required"}
        
        # Get recommendations
        result = recommender.recommend(body_shape, occasion)
        return result
    except json.JSONDecodeError:
        print("Invalid JSON received")
        return {"success": False, "error": "Invalid JSON format"}
    except Exception as e:
        print(f"Error in get_recommendations: {e}")
        traceback.print_exc()
        return {"success": False, "error": str(e)}