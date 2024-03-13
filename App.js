import React, { useState, useEffect, useRef} from 'react'
import { StyleSheet, Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import {Camera,CameraType} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Button from './src/components/Button';
import { Video } from 'expo-av';
import {shareAsync} from 'expo-sharing';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(null);
  const [video, setVideo] = useState(null);
  const [videoUri, setVideoUri] = useState(null);

  useEffect(() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const microphonePermission = await Camera.requestMicrophonePermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      setHasMicrophonePermission(microphonePermission.status === 'granted');
      setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');
    })();
},  [])

if (hasCameraPermission === undefined || hasMicrophonePermission === undefined) {
  return <Text>Requestion permissions...</Text>
} else if (!hasCameraPermission) {
  return <Text>Permission for camera not granted.</Text>
}

const recordVideo = () => {
  setIsRecording(true);
  setVideoUri(recordVideo.uri)
  let options = {
    quality: "1080p",
    maxDuration: 60,
    mute: false
  };

  cameraRef.current.recordAsync(options).then((recordedVideo) => {
    setVideo(recordedVideo);
    setIsRecording(false);
  });
};

const stopRecording = () => {
  setIsRecording(false);
  cameraRef.current.stopRecording();
};

if (video) {
  let shareVideo = () => {
    shareAsync(video.uri).then(() => {
      setVideo(undefined);
    });
  };

  const saveVideo = () => {
    MediaLibrary.saveToLibraryAsync(video.uri).then(() => {
      setVideo(undefined);
    });
  };

  const handleVideoRecorded = (recordedVideo) => {
    setVideo(recordedVideo);
    setIsRecording(false);
    // Optionally, upload immediately or call this function on button press
    uploadVideo(recordedVideo.uri);
  };

  const uploadVideo = async () => { 
    const formData = new FormData();
    formData.append('video', {
      uri: videoUri,
      type: 'video/quicktime', 
      name: 'upload.mov', 
    });
    
    try {
      const response = await fetch('http://127.0.0.1:5000', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = await response.text();
      console.log('Upload success:', result);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Video
        style={styles.video}
        source={{uri: video.uri}}
        useNativeControls
        resizeMode='contain'
        isLooping
        type = {type}
        flashMode={flash}
        ref={cameraRef}
      />
      <Button title="Share" onPress={shareVideo} />
      {hasMediaLibraryPermission ? <Button title="Upload" onPress={uploadVideo} /> : undefined}
      <Button title="Discard" onPress={() => setVideo(undefined)} />
    </SafeAreaView>
  );
}
return (
  <Camera style={styles.container} ref={cameraRef}>
    <View style={styles.buttonContainer}>
    <TouchableOpacity 
          style={styles.iconButton} 
          onPress={isRecording ? stopRecording : recordVideo}
        >
          <Icon name={isRecording ? "stop-circle" : "video-camera"} size={30} color="#FFF" />
        </TouchableOpacity>
    </View>
  </Camera>
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
},
buttonContainer: {
  backgroundColor: 'transparent',
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: 50,
  justifyContent: 'center',
  alignItems: "center",
  paddingBottom: 0
},
iconButton: {
  padding: 10,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: 25,
},
video: {
  flex: 1,
  alignSelf: "stretch"
}
});
