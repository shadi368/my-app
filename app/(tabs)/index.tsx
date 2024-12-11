import React, { useState, useEffect } from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Button,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import axios from 'axios';

export default function ImageComparisonScreen() {
  const [image1, setImage1] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions();
  const [galleryPermission, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();

  // Request permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      if (!cameraPermission?.granted) await requestCameraPermission();
      if (!galleryPermission?.granted) await requestGalleryPermission();
      if (!cameraPermission?.granted || !galleryPermission?.granted) {
        Alert.alert('Permissions Required', 'Camera and gallery permissions are needed to use this app.');
      }
    };

    requestPermissions();
  }, [cameraPermission, galleryPermission]);

  // Open image picker
  const pickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (!galleryPermission?.granted) {
      const permissionResult = await requestGalleryPermission();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Gallery access permission is required.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    } else {
      Alert.alert('Cancelled', 'Image selection was cancelled.');
    }
  };

  // Take a photo
  const takePhoto = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (!cameraPermission?.granted) {
      const permissionResult = await requestCameraPermission();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Camera access permission is required.');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      } else {
        Alert.alert('Cancelled', 'Photo capture was cancelled.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while trying to access the camera.');
    }
  };

  // Handle the image comparison
  const handleCompare = async () => {
    if (!image1 || !image2) {
      Alert.alert('Error', 'Please select two images before comparing.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image1', {
        uri: image1,
        name: 'image1.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('image2', {
        uri: image2,
        name: 'image2.jpg',
        type: 'image/jpeg',
      } as any);

      axios({
        method: "post",
        url: "myurl",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (response.status === 200) {
        const { message } = response.data;
        setComparisonResult(message);
        Alert.alert('Success', message);
      } else {
        Alert.alert('Error', response.data.message || 'Comparison failed.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'An error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compare Two Images</Text>

      <View style={styles.imageContainer}>
        {/* Image 1 selection */}
        <TouchableOpacity style={styles.imageWrapper} onPress={() => pickImage(setImage1)}>
          {image1 ? (
            <Image source={{ uri: image1 }} style={styles.image} />
          ) : (
            <Text style={styles.placeholderText}>Select Image 1</Text>
          )}
        </TouchableOpacity>

        {/* Image 2 - Take Photo */}
        <TouchableOpacity style={styles.imageWrapper} onPress={() => takePhoto(setImage2)}>
          {image2 ? (
            <Image source={{ uri: image2 }} style={styles.image} />
          ) : (
            <Text style={styles.placeholderText}>Take Photo for Image 2</Text>
          )}
        </TouchableOpacity>
      </View>

      {image1 && image2 && (
        <>
          <Text style={styles.comparisonNote}>
            Both images are now displayed. Tap on an image to replace it.
          </Text>
          <View style={styles.compareButtonContainer}>
            <Button title="Compare Images" onPress={handleCompare} />
          </View>
        </>
      )}

      {loading && <ActivityIndicator size="large" color="#000" style={styles.loader} />}

      {comparisonResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{comparisonResult}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  imageWrapper: {
    width: '45%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  comparisonNote: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginTop: 20,
  },
  compareButtonContainer: {
    marginTop: 20,
    width: '100%',
  },
  loader: {
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    color: '#2E8B57',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
