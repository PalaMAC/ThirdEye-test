from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)

# Specify a directory to save uploaded files
# Ensure this directory exists or create it
UPLOAD_FOLDER = r'C:\Users\AutomaC\Desktop\ThirdEye\ThirdEye-test\Backend'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Allow files with these extensions
ALLOWED_EXTENSIONS = {'mov', 'mp4'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_video():
    # Check if the post request has the file part
    if 'video' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['video']
    
    # If the user does not select a file, the browser submits an
    # empty file without a filename.
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)
        return jsonify({'message': f'Video {filename} uploaded successfully'}), 200
    
    return jsonify({'error': 'File extension not allowed'}), 400

if __name__ == '__main__':
    app.run(debug=True, host='exp://192.168.2.80', port=8081)