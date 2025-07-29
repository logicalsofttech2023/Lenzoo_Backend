from flask import Flask, request, jsonify
import cv2
import mediapipe as mp
import numpy as np
import uuid
import os

app = Flask(__name__)
mp_face_mesh = mp.solutions.face_mesh

# Standard credit card width in mm
CREDIT_CARD_WIDTH_MM = 85.60

UPLOAD_FOLDER = "measurementsImages"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/process", methods=["POST"])
def process_image():
    if "image" not in request.files:
        print("No image file in request.")
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]
    if file.filename == "":
        print("Empty filename received.")
        return jsonify({"error": "Empty filename"}), 400

    temp_filename = os.path.join(UPLOAD_FOLDER, f"temp_{uuid.uuid4().hex}.jpg")
    file.save(temp_filename)
    print(f"Image received: {file.filename}, saved temporarily as: {temp_filename}")

    try:
        image = cv2.imread(temp_filename)
        if image is None:
            print("Could not read image using OpenCV.")
            return jsonify({"error": "Invalid image file"}), 400

        h, w = image.shape[:2]

        with mp_face_mesh.FaceMesh(
            static_image_mode=True, max_num_faces=1, refine_landmarks=True
        ) as face_mesh:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb_image)

            if not results.multi_face_landmarks:
                print("No face detected.")
                return jsonify({"error": "No face detected"}), 422

            landmarks = results.multi_face_landmarks[0].landmark

            # Validate sufficient landmarks, including iris points
            if len(landmarks) < 478 or landmarks[468].x == 0 or landmarks[473].x == 0:
                print("Insufficient or invalid facial landmarks detected.")
                return jsonify({"error": "Incomplete facial landmarks detected"}), 422

            # Key facial points extraction
            left_pupil_pixel = np.array([landmarks[468].x * w, landmarks[468].y * h])
            right_pupil_pixel = np.array([landmarks[473].x * w, landmarks[473].y * h])
            nose_tip_pixel = np.array([landmarks[1].x * w, landmarks[1].y * h])
            top_of_face_pixel = np.array([landmarks[10].x * w, landmarks[10].y * h])
            chin_bottom_pixel = np.array([landmarks[152].x * w, landmarks[152].y * h])

            # Facial width points
            jaw_left_pixel = np.array([landmarks[454].x * w, landmarks[454].y * h])
            jaw_right_pixel = np.array([landmarks[234].x * w, landmarks[234].y * h])
            cheekbone_left_pixel = np.array([landmarks[323].x * w, landmarks[323].y * h])
            cheekbone_right_pixel = np.array([landmarks[93].x * w, landmarks[93].y * h])
            forehead_left_pixel = np.array([landmarks[301].x * w, landmarks[301].y * h])
            forehead_right_pixel = np.array([landmarks[71].x * w, landmarks[71].y * h])

            # Calculate pixel distances
            pd_pixel = np.linalg.norm(right_pupil_pixel - left_pupil_pixel)
            eye_center_pixel = (left_pupil_pixel + right_pupil_pixel) / 2
            pupil_height_pixel = np.linalg.norm(eye_center_pixel - top_of_face_pixel)
            npd_left_pixel = np.linalg.norm(left_pupil_pixel - nose_tip_pixel)
            npd_right_pixel = np.linalg.norm(right_pupil_pixel - nose_tip_pixel)

            jaw_width_pixel = np.linalg.norm(jaw_right_pixel - jaw_left_pixel)
            cheekbone_width_pixel = np.linalg.norm(cheekbone_right_pixel - cheekbone_left_pixel)
            forehead_width_pixel = np.linalg.norm(forehead_right_pixel - forehead_left_pixel)
            face_length_pixel = np.linalg.norm(chin_bottom_pixel - top_of_face_pixel)

            # Check for reference object (e.g., credit card or ruler) - simplified logic
            # This is a placeholder; actual detection would require object recognition
            pixels_per_mm = 1.0  # Default fallback
            if jaw_width_pixel > 0:
                # Rough estimate assuming average jaw width is ~130-150 mm for adults
                pixels_per_mm = jaw_width_pixel / 140.0  # Adjustable average jaw width

            print(f"Calculated pixels_per_mm (based on jaw width): {pixels_per_mm:.2f}")

            # Convert pixel measurements to mm
            pd_mm = pd_pixel / pixels_per_mm if pixels_per_mm > 0 else pd_pixel
            pupil_height_mm = pupil_height_pixel / pixels_per_mm if pixels_per_mm > 0 else pupil_height_pixel
            npd_left_mm = npd_left_pixel / pixels_per_mm if pixels_per_mm > 0 else npd_left_pixel
            npd_right_mm = npd_right_pixel / pixels_per_mm if pixels_per_mm > 0 else npd_right_pixel
            face_length_mm = face_length_pixel / pixels_per_mm if pixels_per_mm > 0 else face_length_pixel
            cheekbone_width_mm = cheekbone_width_pixel / pixels_per_mm if pixels_per_mm > 0 else cheekbone_width_pixel
            jaw_width_mm = jaw_width_pixel / pixels_per_mm if pixels_per_mm > 0 else jaw_width_pixel
            forehead_width_mm = forehead_width_pixel / pixels_per_mm if pixels_per_mm > 0 else forehead_width_pixel

            print(f"   Measurements (in pixels):")
            print(f"   PD (pixels)        = {pd_pixel:.2f}")
            print(f"   PH (pixels)        = {pupil_height_pixel:.2f}")
            print(f"   NPD Left (pixels)  = {npd_left_pixel:.2f}")
            print(f"   NPD Right (pixels) = {npd_right_pixel:.2f}")
            print(f"   Face Length (pixels)= {face_length_pixel:.2f}")
            print(f"   Cheekbone Width (pixels) = {cheekbone_width_pixel:.2f}")
            print(f"   Jaw Width (pixels)       = {jaw_width_pixel:.2f}")
            print(f"   Forehead Width (pixels) = {forehead_width_pixel:.2f}")

            print(f"   Measurements (converted to mm):")
            print(f"   Face Length       = {face_length_mm:.2f} mm")
            print(f"   Cheekbone Width   = {cheekbone_width_mm:.2f} mm")
            print(f"   Jaw Width         = {jaw_width_mm:.2f} mm")
            print(f"   Forehead Width    = {forehead_width_mm:.2f} mm")

            # Face Shape Determination
            face_shape = "Unknown"
            epsilon = 1e-6  # Prevent division by zero

            measurements = {
                "length": face_length_mm + epsilon,
                "cheekbone": cheekbone_width_mm + epsilon,
                "jaw": jaw_width_mm + epsilon,
                "forehead": forehead_width_mm + epsilon,
            }

            ratios = {
                "length_to_width": measurements["length"] / measurements["cheekbone"],
                "jaw_to_cheekbone": measurements["jaw"] / measurements["cheekbone"],
                "forehead_to_cheekbone": measurements["forehead"] / measurements["cheekbone"],
                "forehead_to_jaw": measurements["forehead"] / measurements["jaw"],
            }

            # Classification thresholds
            TIGHT_SIMILARITY = 0.10
            MODERATE_SIMILARITY = 0.15
            SIGNIFICANT_DIFFERENCE = 0.25

            if (
                abs(ratios["length_to_width"] - 1) <= 0.2
                and abs(ratios["forehead_to_cheekbone"] - 1) <= TIGHT_SIMILARITY
                and abs(ratios["jaw_to_cheekbone"] - 1) <= TIGHT_SIMILARITY
            ):
                face_shape = "Square"
            elif (
                ratios["jaw_to_cheekbone"] < (1 - SIGNIFICANT_DIFFERENCE)
                and ratios["forehead_to_cheekbone"] < (1 - SIGNIFICANT_DIFFERENCE)
                and ratios["length_to_width"] > (1 + MODERATE_SIMILARITY)
            ):
                face_shape = "Diamond"
            elif (
                ratios["forehead_to_cheekbone"] > (1 + MODERATE_SIMILARITY)
                and ratios["forehead_to_jaw"] > (1 + SIGNIFICANT_DIFFERENCE)
            ):
                face_shape = "Heart"
            elif (
                ratios["jaw_to_cheekbone"] > (1 + MODERATE_SIMILARITY)
                and ratios["forehead_to_jaw"] < (1 - SIGNIFICANT_DIFFERENCE)
            ):
                face_shape = "Triangle"
            elif (
                abs(ratios["length_to_width"] - 1) <= MODERATE_SIMILARITY
                and abs(ratios["forehead_to_cheekbone"] - 1) <= MODERATE_SIMILARITY
                and abs(ratios["jaw_to_cheekbone"] - 1) <= MODERATE_SIMILARITY
            ):
                face_shape = "Round"
            elif (
                ratios["length_to_width"] > (1 + SIGNIFICANT_DIFFERENCE)
                and abs(ratios["forehead_to_cheekbone"] - 1) <= MODERATE_SIMILARITY
                and abs(ratios["jaw_to_cheekbone"] - 1) <= MODERATE_SIMILARITY
            ):
                face_shape = "Rectangle"
            else:
                face_shape = "Oval"

            # Accuracy and Symmetry
            detected_landmarks = len(landmarks)
            landmark_accuracy = (detected_landmarks / 478) * 100
            symmetry_difference_mm = abs(npd_left_mm - npd_right_mm)
            symmetry_score = max(0, 100 - (symmetry_difference_mm / pd_mm * 100)) if pd_mm > 0 else 0
            final_accuracy = round((landmark_accuracy * 0.6 + symmetry_score * 0.4), 2)

            print(
                f"Face processed. PD: {pd_mm:.1f} mm, PH: {pupil_height_mm:.1f} mm, Shape: {face_shape}, Accuracy: {final_accuracy}%"
            )

            return jsonify(
                {
                    "Pupillary Distance (PD)": f"{pd_mm:.1f} mm",
                    "Pupil Height (PH)": f"{pupil_height_mm:.1f} mm",
                    "Naso-Pupillary Distance (NPD)": {
                        "Left Eye": f"{npd_left_mm:.1f} mm",
                        "Right Eye": f"{npd_right_mm:.1f} mm",
                    },
                    "Face Shape": face_shape,
                    "Measurement Accuracy": f"{final_accuracy}%",
                    "Detailed Measurements": {
                        "Face Length (mm)": round(face_length_mm, 2),
                        "Cheekbone Width (mm)": round(cheekbone_width_mm, 2),
                        "Jaw Width (mm)": round(jaw_width_mm, 2),
                        "Forehead Width (mm)": round(forehead_width_mm, 2),
                    },
                    "Message": "These measurements were estimated using computer vision technology and an assumed scale. For confirmation, please consult a certified professional with proper measuring tools, ideally by using an image with a known reference object.",
                }
            )

    except Exception as e:
        print(f"Error while processing image: {str(e)}")
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
            print(f"Temporary file deleted: {temp_filename}")


@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "Flask server is running!"})


if __name__ == "__main__":
    app.run(port=6006, debug=True)
