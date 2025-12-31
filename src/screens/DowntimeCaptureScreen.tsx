import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useStore } from '../store';
import { Machine, DowntimeEntry } from '../types';
import { DOWNTIME_REASONS } from '../constants/seedData';

interface DowntimeCaptureScreenProps {
  navigation: any;
  route: {
    params: {
      machine: Machine;
    };
  };
}

export default function DowntimeCaptureScreen({
  navigation,
  route,
}: DowntimeCaptureScreenProps) {
  const { machine } = route.params;
  const [step, setStep] = useState<'idle' | 'selecting' | 'running'>('selecting');
  const [selectedReason, setSelectedReason] = useState<any>(null);
  const [selectedSubReason, setSelectedSubReason] = useState<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const addDowntimeEntry = useStore((state) => state.addDowntimeEntry);
  const user = useStore((state) => state.user);

  const handleStartDowntime = () => {
    setStep('selecting');
  };

  const handleReasonSelect = (reason: any) => {
    setSelectedReason(reason);
    if (!reason.children || reason.children.length === 0) {
      setSelectedSubReason(null);
      confirmStart();
    }
  };

  const handleSubReasonSelect = (subReason: any) => {
    setSelectedSubReason(subReason);
    confirmStart();
  };

  const confirmStart = () => {
    setStartTime(Date.now());
    setStep('running');
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const compressed = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
      setPhoto(compressed.uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const compressed = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
      setPhoto(compressed.uri);
    }
  };

  const handleEndDowntime = async () => {
    if (!startTime || !selectedReason) return;

    const entry: DowntimeEntry = {
      id: `dt-${Date.now()}`,
      machineId: machine.id,
      startTime,
      endTime: Date.now(),
      reasonCode: selectedReason.code,
      reasonLabel: selectedReason.label,
      subReasonCode: selectedSubReason?.code,
      subReasonLabel: selectedSubReason?.label,
      photo: photo || undefined,
      tenantId: user?.tenantId || 'tenant-001',
      synced: false,
      createdAt: Date.now(),
    };

    await addDowntimeEntry(entry);

    Alert.alert('Success', 'Downtime recorded successfully', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const renderIdleState = () => (
    <View style={styles.centerContent}>
      <Text style={styles.instruction}>
        Start tracking downtime for {machine.name}
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleStartDowntime}
      >
        <Text style={styles.primaryButtonText}>Start Downtime</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReasonSelection = () => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>Select Downtime Reason</Text>
      {DOWNTIME_REASONS.map((reason) => (
        <TouchableOpacity
          key={reason.code}
          style={[
            styles.reasonButton,
            selectedReason?.code === reason.code && styles.reasonButtonActive,
          ]}
          onPress={() => handleReasonSelect(reason)}
        >
          <Text
            style={[
              styles.reasonText,
              selectedReason?.code === reason.code && styles.reasonTextActive,
            ]}
          >
            {reason.label}
          </Text>
        </TouchableOpacity>
      ))}

      {selectedReason?.children && selectedReason.children.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Select Sub-Reason</Text>
          {selectedReason.children.map((subReason: any) => (
            <TouchableOpacity
              key={subReason.code}
              style={[
                styles.reasonButton,
                selectedSubReason?.code === subReason.code &&
                  styles.reasonButtonActive,
              ]}
              onPress={() => handleSubReasonSelect(subReason)}
            >
              <Text
                style={[
                  styles.reasonText,
                  selectedSubReason?.code === subReason.code &&
                    styles.reasonTextActive,
                ]}
              >
                {subReason.label}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );

  const renderRunningState = () => (
    <View style={styles.content}>
      <View style={styles.runningBanner}>
        <Text style={styles.runningText}>Downtime Active</Text>
        <Text style={styles.runningSubtext}>
          {selectedReason?.label}
          {selectedSubReason ? ` - ${selectedSubReason.label}` : ''}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Add Photo (Optional)</Text>
      {photo ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photo }} style={styles.photo} />
          <TouchableOpacity
            style={styles.removePhotoButton}
            onPress={() => setPhoto(null)}
          >
            <Text style={styles.removePhotoText}>Remove Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.photoActions}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={handleTakePhoto}
          >
            <Text style={styles.photoButtonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={handlePickImage}
          >
            <Text style={styles.photoButtonText}>Choose from Library</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.endButton}
        onPress={handleEndDowntime}
      >
        <Text style={styles.endButtonText}>End Downtime</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'idle' && renderIdleState()}
        {step === 'selecting' && renderReasonSelection()}
        {step === 'running' && renderRunningState()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    padding: 16,
  },
  instruction: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reasonButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  reasonButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  reasonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  reasonTextActive: {
    color: '#2196F3',
  },
  runningBanner: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  runningText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 4,
  },
  runningSubtext: {
    fontSize: 14,
    color: '#E53935',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  photoContainer: {
    marginBottom: 24,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  removePhotoButton: {
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  endButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
