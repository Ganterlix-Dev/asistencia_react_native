import React, { useState } from 'react';
import { View, Text, Button, TextInput, Modal, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';

const { width, height } = Dimensions.get('window');

const App = () => {
  const [name, setName] = useState('');
  const [materia, setMateria] = useState('');
  const [surname, setSurname] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showQRCode, setShowQRCode] = useState(false); 
  const [currentDate, setCurrentDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [generationTime, setGenerationTime] = useState('');

  const handleNameChange = (text) => {
    setName(text);
  };

  const handleMateriaChange = (text) => {
    setMateria(text);
  };

  const handleSurnameChange = (text) => {
    setSurname(text);
  };

  const handleIdNumberChange = (text) => {
    const parsed = parseInt(text, 10);
    setIdNumber(parsed);
  };

  const handleStartChange = (text) => {
    setStartTime(text);
  };

  const handleEndChange = (text) => {
    setEndTime(text);
  };

  const saveData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error al guardar los datos:', error);
    }
  };

  const validateText = (text) => {
    return /^[a-zA-Z\s]+$/.test(text); // Solo permite letras y espacios
  };

  const showModal = (message) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const Generar_QR = () => {
    try {
      if (!name || !materia || !surname || !idNumber || !startTime || !endTime) {
        showModal('Todos los campos son obligatorios.');
        return;
      }

      if (!validateText(name)) {
        showModal('El nombre no puede contener números ni caracteres especiales.');
        return;
      }

      if (!validateText(surname)) {
        showModal('El apellido no puede contener números ni caracteres especiales.');
        return;
      }

      if (!validateText(materia)) {
        showModal('La materia no puede contener números ni caracteres especiales.');
        return;
      }

      if (isNaN(idNumber) || !Number.isInteger(Number(idNumber))) {
        showModal('La cédula debe ser un número entero.');
        return;
      }

      if (!moment(startTime, 'HH:mm:ss', true).isValid() || !moment(endTime, 'HH:mm:ss', true).isValid()) {
        showModal('Por favor, ingrese horas válidas en el formato HH:mm:ss.');
        return;
      }

      const start = moment(startTime, 'HH:mm:ss');
      const end = moment(endTime, 'HH:mm:ss');

      if (end.isBefore(start)) {
        showModal('La hora de salida no puede ser antes de la hora de entrada.');
        return;
      }

      const currentDate = moment().format('DD-MM-YYYY');
      const generationTime = moment().format('HH:mm:ss');
      setCurrentDate(currentDate);
      setGenerationTime(generationTime);

      saveData('current_date', currentDate);
      saveData('name', name);
      saveData('materia', materia);
      saveData('surname', surname);
      saveData('idNumber', idNumber.toString());
      saveData('start_time', startTime);
      saveData('end_time', endTime);
      saveData('generation_time', generationTime);

      setShowQRCode(true);
    } catch (error) {
      console.error('Error al calcular el QR', error);
      setShowQRCode(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.diagonalContainer}>
        <View style={styles.yellowHalf} />
        <View style={styles.redHalf} />
      </View>
      <View style={styles.content}>
        <TextInput style={styles.input} placeholder="Nombre" value={name} onChangeText={handleNameChange} />
        <TextInput style={styles.input} placeholder="Apellido" value={surname} onChangeText={handleSurnameChange} />
        <TextInput style={styles.input} placeholder="Cédula" value={idNumber.toString()} onChangeText={handleIdNumberChange} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Materia" value={materia} onChangeText={handleMateriaChange} />
        <TextInput style={styles.input} placeholder="Hora de inicio" value={startTime} onChangeText={handleStartChange} keyboardType="numbers-and-punctuation" />
        <TextInput style={styles.input} placeholder="Hora de finalización" value={endTime} onChangeText={handleEndChange} keyboardType="numbers-and-punctuation" />
        <Button title="Generar QR" onPress={Generar_QR} />
        <p>Generado a las: {generationTime}</p>
        {showQRCode && (
          <QRCode
            value={`${name},${surname},${idNumber},${materia},${currentDate},${startTime},${endTime}`}
            size={Math.min(width * 0.8, height * 0.8)}
          />
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  div: {
    backgroundColor: '#abb2b9', // Color original: gris claro
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  diagonalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  yellowHalf: { // Cambiado a mitad diagonal amarilla
    backgroundColor: '#f1c40f', // Color amarillo
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center', 
    alignItems: 'center',
    top: 0,
    left: 0,
    transform: [{ rotate: '45deg' }], // Girado en sentido opuesto
  },
  redHalf: { // Cambiado a mitad diagonal roja
    backgroundColor: '#e74c3c', // Color rojo
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center', 
    alignItems: 'center',
    top: 0,
    left: 0,
    transform: [{ rotate: '-45deg' }], // Girado en sentido opuesto
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    width: '80%', // Ajuste del ancho relativo
  },
  input: {
    width: '80%',
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: '#e74c3c', // Color del borde: rojo
    borderRadius: 10,
    backgroundColor: 'white', // Color de fondo: amarillo
  },
  duration: {
    margin: 20,
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#fdfefe', // Color de fondo: blanco
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000', // Sombra negra
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // Ajuste del ancho relativo
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#e74c3c', // Color de fondo del botón de cerrar: rojo
  },
  textStyle: {
    color: '#fdfefe', // Color del texto: blanco
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 30,
    textAlign: 'center',
  },
});

export default App;

