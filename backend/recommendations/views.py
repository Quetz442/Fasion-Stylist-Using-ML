from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
import base64
import io
import cv2
from PIL import Image
import google.generativeai as genai
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

# Import your model-based recommender
from .bodyshape import ClothingRecommender
from .seasonalcolour import SeasonalColorRecommender  # Import the seasonal color logic

# Initialize the recommender once
recommender = ClothingRecommender(os.path.join(os.path.dirname(__file__), "MOCK_DATA.csv"))

# Configure the Gemini API key
genai.configure(api_key=settings.GEMINI_API_KEY)

class RecommendationView(APIView):
    def post(self, request):
        body_shape = request.data.get("body_shape")
        occasion = request.data.get("occasion")  # occasion can be None

        if not body_shape:
            return Response({"error": "Body shape is required"}, status=status.HTTP_400_BAD_REQUEST)

        # No need to capitalize manually, let recommender handle exact match
        result = recommender.recommend(body_shape, occasion)

        if result['success']:
            return Response({
                "body_shape": body_shape,
                "occasion": occasion,
                "recommendations": result['recommendations']
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": result['error']}, status=status.HTTP_400_BAD_REQUEST)

class MetadataView(APIView):
    """Optional: To fetch available body shapes and occasions for the frontend."""
    def get(self, request):
        return Response({
            "body_shapes": recommender.get_body_shapes(),
            "occasions": recommender.get_occasions()
        }, status=status.HTTP_200_OK)

class SeasonalColourView(APIView):
    def post(self, request):
        # Extract data from the request
        eye_color = request.data.get("eye_color")
        hair_color = request.data.get("hair_color")
        skin_tone = request.data.get("skin_tone")

        # Validate input
        if not eye_color or not hair_color or not skin_tone:
            return Response({"error": "Eye color, hair color, and skin tone are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Provide the correct data path for SeasonalColorRecommender
        data_path = os.path.join(os.path.dirname(__file__), "seasonalcolour.csv")
        analyzer = SeasonalColorRecommender(data_path)  # Pass the data_path argument

        # Perform seasonal color analysis
        result = analyzer.analyze(eye_color, hair_color, skin_tone)

        # Return the result
        if result['success']:
            return Response({
                "season": result['season'],
                "complementary_colors": result['complementary_colors'],
                "color_combinations": result['color_combinations']
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": result['error']}, status=status.HTTP_400_BAD_REQUEST)

class BodyShapesView(APIView):
    def get(self, request):
        try:
            body_shapes = recommender.get_body_shapes()
            return Response(body_shapes, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SeasonRecommendationsView(APIView):
    def post(self, request):
        user_season = request.data.get("season")
        if not user_season:
            return Response({"error": "Season is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            data_path = os.path.join(os.path.dirname(__file__), "seasonalcolour.csv")
            analyzer = SeasonalColorRecommender(data_path)
            result = analyzer.get_season_recommendations(user_season)

            if "error" in result:
                return Response({"error": result["error"]}, status=status.HTTP_400_BAD_REQUEST)

            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@require_POST
def detect_body_shape_image(request):
    """Advanced body shape detection with specialized anti-bias measures"""
    try:
        # Check if we have an image
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'No image provided'}, status=400)
        
        # Get image from request
        image_file = request.FILES['image']
        
        # Read image bytes
        image_bytes = image_file.read()
        
        # Process image for optimal AI analysis
        try:
            img = Image.open(io.BytesIO(image_bytes))
            # Convert the image to RGB mode if needed
            if img.mode != "RGB":
                img = img.convert("RGB")
            
            # Resize if the image is too large while preserving aspect ratio
            max_size = 1500  # Maximum dimension for analysis
            if max(img.size) > max_size:
                img.thumbnail((max_size, max_size))
            
            # Enhanced image processing pipeline
            from PIL import ImageEnhance, ImageFilter
            
            # Apply slight sharpening to enhance edges
            img = img.filter(ImageFilter.SHARPEN)
            
            # Enhance contrast to better differentiate body outline
            enhancer_contrast = ImageEnhance.Contrast(img)
            img = enhancer_contrast.enhance(1.5)  # Increased contrast enhancement
            
            # Slightly increase brightness for better feature detection
            enhancer_brightness = ImageEnhance.Brightness(img)
            img = enhancer_brightness.enhance(1.2)  # Increased brightness
            
            # Additional processing - apply edge enhancement to better detect body contours
            img = img.filter(ImageFilter.EDGE_ENHANCE)
            
            # Convert the PIL Image object to bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format="JPEG", quality=95)  # High quality JPEG
            image_bytes = img_byte_arr.getvalue()
            
        except Exception as img_error:
            return JsonResponse({'error': f'Image processing error: {str(img_error)}'}, status=400)
        
        # Load Gemini model - use the most capable model for improved accuracy
        model = genai.GenerativeModel('gemini-1.5-pro')  
        
        # Base prompt with detailed anti-bias measures
        base_prompt = """Analyze this person's body shape in the image with extreme precision.

IMPORTANT: There is a known bias in body shape classification where the 'Rectangle' shape is over-assigned. Only classify as Rectangle if there is clear evidence of minimal waist definition (<10% difference between shoulders, waist, and hips).

Body Shape Analysis Guidelines:
1. Focus primarily on the visual waist-to-hip ratio which is the most important indicator.
2. Look carefully for ANY waist definition - even slight indentation at the waist area suggests a non-Rectangle shape.
3. Pay close attention to how clothing drapes on the body - fitted clothing often reveals the true body shape beneath.
4. For women especially, the presence of ANY visible waist curve typically indicates Hourglass rather than Rectangle.
5. Be especially careful not to mistake athletic builds with visible waist definition for Rectangle shapes.

Classify the body shape as EXACTLY ONE of the following types:

- Hourglass: 
  • ANY clearly visible curve inward at the waist area
  • Balanced shoulder and hip width
  • Curved silhouette
  • Clothing typically hangs with visible indentation at waist

- Pear/Triangle: 
  • Hips visibly wider than shoulders
  • May have some waist definition
  • Lower body appears more substantial than upper body

- Apple/Round: 
  • Fuller midsection with less defined waistline
  • Often with slimmer legs and arms
  • Bust/chest may be larger than hips

- Inverted Triangle: 
  • Shoulders visibly wider than hips
  • Athletic-looking upper body
  • Narrower hip line

- Rectangle/Straight: 
  • REQUIRES clear evidence of minimal waist definition
  • Nearly straight line from shoulders to hips when viewed from front
  • Clothing typically hangs straight down without indentation
  • No visible inward curve at the waist area

Examine the image carefully for any waist definition before concluding Rectangle. The Rectangle classification should be used ONLY when there is clear evidence of minimal waist definition and straight silhouette.

After examination, respond with ONLY the body shape name. Choose EXACTLY ONE from: Hourglass, Pear, Apple, Inverted Triangle, or Rectangle."""
        
        # Get the body shape result
        response = model.generate_content(
            contents=[
                {
                    "parts": [
                        {
                            "mime_type": "image/jpeg",
                            "data": image_bytes
                        },
                        {
                            "text": base_prompt
                        }
                    ]
                }
            ],
            generation_config={
                "temperature": 0.1,
                "max_output_tokens": 30
            }
        )
        response.resolve()
        
        # Extract the detected shape from the response
        detected_shape = response.text.strip()
        
        # Map variations or longer responses to standard shape names
        shape_map = {
            "hourglass": "Hourglass",
            "pear": "Pear",
            "triangle": "Pear",  # Map triangle to Pear
            "apple": "Apple", 
            "round": "Apple",  # Map round to Apple
            "inverted triangle": "Inverted Triangle",
            "rectangle": "Rectangle",
            "straight": "Rectangle"  # Map straight to Rectangle
        }
        
        # Find the closest matching standard shape
        detected_shape_lower = detected_shape.lower()
        for key, value in shape_map.items():
            if key in detected_shape_lower:
                detected_shape = value
                break
        
        # If no match is found, default to the most likely shape based on statistics
        if detected_shape not in ["Hourglass", "Pear", "Apple", "Inverted Triangle", "Rectangle"]:
            detected_shape = "Hourglass"  # Default to Hourglass as a fallback
            
        # Return only the body shape as a string
        return JsonResponse({'body_shape': detected_shape})
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return JsonResponse({
            'error': f'Image analysis failed: {str(e)}',
            'details': error_details
        }, status=500)

@csrf_exempt
@require_POST
def analyze_seasonal_color(request):
    """Analyze facial features to determine seasonal color classification with improved accuracy"""
    try:
        # Check if we have an image
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'No image provided'}, status=400)
        
        # Get image from request
        image_file = request.FILES['image']
        
        # Read image bytes
        image_bytes = image_file.read()
        
        # Process image for optimal facial feature analysis
        try:
            img = Image.open(io.BytesIO(image_bytes))
            # Convert the image to RGB mode if needed
            if img.mode != "RGB":
                img = img.convert("RGB")
            
            # Resize if the image is too large while preserving aspect ratio
            max_size = 1500  # Maximum dimension for analysis
            if max(img.size) > max_size:
                img.thumbnail((max_size, max_size))
            
            # Enhanced image processing for better color analysis
            from PIL import ImageEnhance
            import numpy as np
            
            # Enhanced color saturation for better color detection
            enhancer_color = ImageEnhance.Color(img)
            img = enhancer_color.enhance(1.3)  # Increased color enhancement
            
            # Increase contrast to better differentiate features and detect contrast levels
            enhancer_contrast = ImageEnhance.Contrast(img)
            img = enhancer_contrast.enhance(1.2)  # Increased contrast enhancement
            
            # Optimize brightness for accurate color reading
            enhancer_brightness = ImageEnhance.Brightness(img)
            img = enhancer_brightness.enhance(1.05)
            
            # Convert the PIL Image object to bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format="JPEG", quality=95)  # High quality JPEG
            image_bytes = img_byte_arr.getvalue()
            
        except Exception as img_error:
            return JsonResponse({'error': f'Image processing error: {str(img_error)}'}, status=400)
        
        # Load Gemini model for analysis
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Improved prompt for color season analysis with enhanced differentiation
        analysis_prompt = """Analyze this person's facial features to determine their seasonal color palette classification.

First, carefully assess the PRIMARY DETERMINING FACTORS:

1. CONTRAST LEVEL (CRITICAL):
   - HIGH CONTRAST: Sharp, dramatic difference between hair, skin, and eyes (strongly favors Winter)
   - MEDIUM-HIGH CONTRAST: Clear distinction between features (favors Spring or Winter)
   - MEDIUM-LOW CONTRAST: Moderate distinction between features (favors Autumn)
   - LOW CONTRAST: Soft, blended transitions between features (favors Summer)

2. UNDERTONE TEMPERATURE:
   - COOL: Blue/pink/ash undertones (favors Winter or Summer)
   - WARM: Golden/yellow/peach undertones (favors Spring or Autumn)

3. CLARITY VS. MUTEDNESS:
   - CLEAR: Bright, vivid, crisp coloring (favors Winter or Spring)
   - MUTED: Soft, dusty, toned-down coloring (favors Summer or Autumn)

Then carefully examine these specific features:

4. HAIR COLOR:
   - WINTER: Dark brown to blue-black, cool dark brown, or platinum blonde; never golden/warm
   - SUMMER: Ash blonde, cool medium brown, or silver-gray; never warm/golden/red
   - AUTUMN: Copper, auburn, warm brown, golden brown, or golden blonde 
   - SPRING: Golden blonde, strawberry blonde, warm medium brown with golden highlights

5. SKIN TONE:
   - WINTER: Porcelain white, olive with blue undertones, cool beige, or deep cool brown
   - SUMMER: Pale pink-beige, neutral beige with pink undertones, or cool light brown
   - AUTUMN: Ivory with peach undertones, golden beige, or warm medium brown
   - SPRING: Ivory with golden undertones, peach, or warm golden brown

6. EYE COLOR:
   - WINTER: Clear, bright - black, cool brown, bright blue, or clear green
   - SUMMER: Soft, muted - gray-blue, soft brown, soft green, or gray
   - AUTUMN: Warm, intense - amber, copper, hazel, forest green, or warm brown
   - SPRING: Clear, bright - golden brown, turquoise, bright green, or clear blue

SPECIAL WINTER VS. SUMMER DISTINCTION:
Winter and Summer are both cool seasons but differ crucially in:
- CONTRAST: Winter has HIGH contrast, Summer has LOW contrast
- INTENSITY: Winter looks are CLEAR and BRIGHT, Summer looks are SOFT and MUTED
- IMPACT: Winter features appear STRIKING and DRAMATIC, Summer features appear GENTLE and SUBTLE

Based on these characteristics, classify the person into EXACTLY ONE seasonal color palette:

- WINTER: High contrast, cool undertones, clear and bright colors
- SUMMER: Low contrast, cool undertones, soft and muted colors
- AUTUMN: Medium contrast, warm undertones, rich and muted colors
- SPRING: Medium-high contrast, warm undertones, clear and bright colors

Pay special attention to the clearest, most obvious features first. If you see HIGH CONTRAST between hair, skin and eyes, this strongly indicates WINTER.

After examination, respond with ONLY the seasonal color palette name. Choose EXACTLY ONE from: Spring, Summer, Autumn, or Winter."""
        
        # Get the seasonal color analysis result
        response = model.generate_content(
            contents=[
                {
                    "parts": [
                        {
                            "mime_type": "image/jpeg",
                            "data": image_bytes
                        },
                        {
                            "text": analysis_prompt
                        }
                    ]
                }
            ],
            generation_config={
                "temperature": 0.1,
                "max_output_tokens": 30
            }
        )
        response.resolve()
        
        # Extract the detected season from the response
        detected_season = response.text.strip()
        
        # Map variations or longer responses to standard season names
        season_map = {
            "spring": "Spring",
            "summer": "Summer",
            "autumn": "Autumn",
            "fall": "Autumn",  # Map fall to Autumn
            "winter": "Winter"
        }
        
        # Find the closest matching standard season
        detected_season_lower = detected_season.lower()
        for key, value in season_map.items():
            if key in detected_season_lower:
                detected_season = value
                break
        
        # If no match is found or unclear, run a more specific analysis focused on contrast
        if detected_season not in ["Spring", "Summer", "Autumn", "Winter"]:
            # Additional analysis focusing specifically on contrast levels
            contrast_focused_prompt = """Re-analyze this person's facial features, focusing PRIMARILY on CONTRAST LEVEL:

1. HIGH CONTRAST between hair, skin, and eyes indicates WINTER
   - Dark hair with light skin is a strong Winter indicator
   - Clear, defined eyes with strong color differentiation
   - Overall impression is dramatic and striking

2. LOW CONTRAST between hair, skin, and eyes indicates SUMMER
   - Hair color is not dramatically different from skin tone
   - Features blend together with soft transitions
   - Overall impression is gentle and subtle

3. MEDIUM CONTRAST with WARM undertones indicates AUTUMN
   - Warm-toned hair that is distinctly different from skin, but not dramatically so
   - Eyes typically have warm flecks or are warm-toned
   - Colors appear rich but muted

4. MEDIUM-HIGH CONTRAST with WARM undertones indicates SPRING
   - Warm-toned hair that contrasts clearly with skin
   - Eyes are often bright and clear
   - Overall impression is bright and warm

Based on CONTRAST LEVEL as the primary factor, classify this person as EXACTLY ONE of: Winter, Summer, Autumn, or Spring."""

            secondary_response = model.generate_content(
                contents=[
                    {
                        "parts": [
                            {
                                "mime_type": "image/jpeg",
                                "data": image_bytes
                            },
                            {
                                "text": contrast_focused_prompt
                            }
                        ]
                    }
                ],
                generation_config={
                    "temperature": 0.1,
                    "max_output_tokens": 30
                }
            )
            secondary_response.resolve()
            detected_season = secondary_response.text.strip()
            
            # Apply the season mapping again
            detected_season_lower = detected_season.lower()
            for key, value in season_map.items():
                if key in detected_season_lower:
                    detected_season = value
                    break
        
        # If still no match, conduct a third analysis specifically for high contrast faces
        if detected_season not in ["Spring", "Summer", "Autumn", "Winter"]:
            # Third analysis specifically for high contrast features
            high_contrast_prompt = """This image appears to be difficult to classify.

Look ONLY at the level of contrast between hair, skin, and eyes:

- If there is HIGH CONTRAST (dark hair with light skin, or very clear distinct features), classify as WINTER.
- If there is LOW CONTRAST (hair color similar to skin tone, soft blended features), classify as SUMMER.
- If there is MEDIUM CONTRAST with WARM tones, classify as AUTUMN.
- If there is MEDIUM-HIGH CONTRAST with WARM tones, classify as SPRING.

Important: For faces with dark hair and light skin, the default classification should be WINTER unless there is clear evidence of warmth (golden/red tones) indicating AUTUMN.

Choose EXACTLY ONE season: Winter, Summer, Autumn, or Spring."""

            tertiary_response = model.generate_content(
                contents=[
                    {
                        "parts": [
                            {
                                "mime_type": "image/jpeg",
                                "data": image_bytes
                            },
                            {
                                "text": high_contrast_prompt
                            }
                        ]
                    }
                ],
                generation_config={
                    "temperature": 0.1,
                    "max_output_tokens": 30
                }
            )
            tertiary_response.resolve()
            detected_season = tertiary_response.text.strip()
            
            # Apply the season mapping one more time
            detected_season_lower = detected_season.lower()
            for key, value in season_map.items():
                if key in detected_season_lower:
                    detected_season = value
                    break
        
        # If still no match, default to Winter for high contrast faces
        if detected_season not in ["Spring", "Summer", "Autumn", "Winter"]:
            # Analyze for high contrast as a final fallback
            img_array = np.array(img)
            
            # Simple contrast detection (very basic)
            try:
                # Convert to grayscale for contrast analysis
                if len(img_array.shape) == 3:
                    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
                else:
                    gray = img_array
                
                # Calculate histogram
                hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
                
                # Calculate standard deviation of pixel values as contrast measure
                std_dev = np.std(gray)
                
                # High standard deviation indicates high contrast
                if std_dev > 60:  # Threshold determined empirically
                    detected_season = "Winter"
                else:
                    detected_season = "Summer"
            except:
                # If image processing fails, default to Winter for safety
                detected_season = "Winter"
            
        
        return JsonResponse({
            'season': detected_season,
        })
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return JsonResponse({
            'error': f'Image analysis failed: {str(e)}',
            'details': error_details
        }, status=500)

