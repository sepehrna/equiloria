import React, {useEffect, useRef, useState} from 'react';
import {Image, StyleSheet, Text, TextInput, View} from 'react-native';
import {Camera} from 'expo-camera';
import {RouteProp, useFocusEffect, useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../routers/ApplicationNavigationContainer";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import ActionButton from "../components/ActionButton";
import {CameraCapturedPicture, PermissionResponse} from "expo-camera/src/Camera.types";
import {sendToGoogle} from "../../controller/ExternalServicesApi";


type ScannerRouteProp = RouteProp<RootStackParamList, 'Scanner'>;
type ScannerScreenProps = {
    route: ScannerRouteProp;
};
const Scanner: React.FC<ScannerScreenProps> = ({route}) => {

    const billName: string = route.params.billName;
    const cameraRef = useRef<Camera | null>(null);

    const [hasPermission, setHasPermission] = useState<boolean | null>(false);
    const [totalAmount, setTotalAmount] = useState<string>('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [cameraOn, setCameraOn] = useState<boolean>(true);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Scanner'>>();

    const navigateToDetail = () => {
        navigation.navigate('BillDetails', {billName: billName, totalAmount: +totalAmount});
    }

    const requestCameraPermission = async () => {
        let permissionResponse: PermissionResponse = await Camera.requestCameraPermissionsAsync();
        setHasPermission(permissionResponse.status === 'granted');
    };

    useFocusEffect(
        React.useCallback(() => {
            requestCameraPermission();
        }, [])
    );

    useEffect(() => {
        return navigation.addListener('blur', () => {
            setCameraOn(false);
        });
    }, [navigation]);

    useFocusEffect(
        React.useCallback(() => {
            setCameraOn(true);
        }, [navigation])
    );

    const recognizeText = async (imageUri: string | undefined) => {
        if (imageUri != null) {
            let recognizedTexts: string[] = [];
            try {
                // recognizedTexts = await TextRecognition.recognize(imageUri, {
                //     visionIgnoreThreshold: 0.5,
                // });
                console.info('................................');
                await sendToGoogle(imageUri);
            } catch (e) {
                console.error(e);
            }
            // recognizedTexts.forEach(recognizedText => recognizedText.replace(/[^\d.-]/g, ''))
            // const amount = recognizedTexts.replace(/[^\d.-]/g, '');
            // setTotalAmount(amount);
        }
    };

    const captureImage = async () => {
        if (cameraRef != null && cameraRef.current != null) {
            try {
                const options = {quality: 0.5, base64: true, exif: false};
                const takenPicture: CameraCapturedPicture = await cameraRef.current.takePictureAsync(options);
                await recognizeText(takenPicture.base64);
                setPhoto(takenPicture.uri);
            } catch (e) {
                console.error(e);
                await captureImage();
            }
        }
    };

    if (hasPermission === null) {
        return <View/>;
    }
    if (!hasPermission) {
        return <View><TextInput>No access to camera</TextInput></View>;
    }

    function getImage() {
        return <Image
            style={styles.tinyLogo}
            source={
                {uri: photo != null ? photo : undefined}
            }
        />;
    }

    function getCamera() {
        console.info(hasPermission);
        return !cameraOn
            ? <View>
                <Text>
                    Camera is turned off!!! Don't worry you still can do it manually ;)
                </Text>
            </View>
            : hasPermission
                ?
                <Camera style={defaultStyles.camera} ref={cameraRef}>
                    <View style={defaultStyles.overlay}/>
                </Camera>
                :
                <View>
                    <Text>
                        Equiloria is not permitted for using camera!!! Don't worry you still can do it manually ;)
                    </Text>
                </View>
    }

    return (
        <View style={defaultStyles.container}>
            {getCamera()}
            <TextInput
                style={defaultStyles.amountInput}
                value={totalAmount}
                keyboardType='numeric'
                placeholder='Total Amount'
                onChangeText={setTotalAmount}
            />
            <View style={defaultStyles.buttonContainer}>
                <ActionButton text={'Take'} backgroundColor={'green'} onPress={captureImage}/>
                <ActionButton text={'Done'} onPress={navigateToDetail}/>
            </View>
        </View>
    );
}

const defaultStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'white',
        borderStyle: 'dashed',
        borderRadius: 10,
        margin: 50,
    },
    amountInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 20,
        marginLeft: 30,
        marginRight: 30,
        paddingLeft: 10,
        borderRadius: 10,
    },
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 30,
    },
});

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
    },
    tinyLogo: {
        width: 50,
        height: 50,
    },
    logo: {
        width: 66,
        height: 58,
    },
});

export default Scanner;
