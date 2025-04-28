from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
import base64
import io
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