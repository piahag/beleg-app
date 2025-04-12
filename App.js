import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { TouchableOpacity , Platform, ToastAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';






export default function App() {
  const [amount, setAmount] = useState('');
  const [filterType, setFilterType] = useState('Alle'); // Einnahme, Ausgabe, Alle
const [filterCategory, setFilterCategory] = useState('Alle'); // Kategorie oder Alle
const [sortMode, setSortMode] = useState('Datum'); // Betrag oder Datum
  const [type, setType] = useState('Ausgabe');
  const [entries, setEntries] = useState([]);
  const filteredEntries = entries
  .filter((e) =>
    (filterType === 'Alle' || e.type === filterType) &&
    (filterCategory === 'Alle' || e.category === filterCategory)
  )
  .sort((a, b) => {
    if (sortMode === 'Betrag') return b.amount - a.amount;
    return new Date(b.date) - new Date(a.date); // neueste oben
  });
  const [category, setCategory] = useState('Sonstiges');
  const [image, setImage] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [date, setDate] = useState(new Date());
const [showDatePicker, setShowDatePicker] = useState(false);
const getCategoryIcon = (category) => {
  switch (category) {
    case 'Geschäftsessen':
      return 'restaurant';
    case 'Technik':
      return 'devices';
    case 'Reisen':
      return 'flight';
    case 'Sonstiges':
    default:
      return 'more-horiz';
  }
};

useEffect(() => {
  const loadEntries = async () => {
    const saved = await AsyncStorage.getItem('entries');
    if (saved) setEntries(JSON.parse(saved));
  };
  loadEntries();
}, []);
  const totalIncome = entries
  .filter((e) => e.type === 'Einnahme')
  .reduce((sum, e) => sum + e.amount, 0);
  // const handleAdd = async () => {
    
  const handleDelete = (id) => {
    Alert.alert(
      'Eintrag löschen',
      'Möchtest du diesen Eintrag wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            setEntries((prev) => prev.filter((entry) => entry.id !== id));
  
            if (Platform.OS === 'android') {
              ToastAndroid.show('Eintrag gelöscht', ToastAndroid.SHORT);
            } else {
              // Optional: Für iOS ein eigenes Toast-Modul nutzen oder Alert.alert
              Alert.alert('Eintrag gelöscht');
            }
          },
        },
      ]
    );
  };
  
const totalExpense = entries
  .filter((e) => e.type === 'Ausgabe')
  .reduce((sum, e) => sum + e.amount, 0);

const totalBalance = totalIncome - totalExpense;

  // const handleDelete = (id) => {
  //   setEntries(entries.filter((entry) => entry.id !== id));
  // };
  const handleClearAll = () => {
    Alert.alert(
      'Alle Einträge löschen',
      'Bist du sicher, dass du wirklich ALLE Einträge löschen möchtest?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            setEntries([]);
  
            if (Platform.OS === 'android') {
              ToastAndroid.show('Alle Einträge gelöscht', ToastAndroid.SHORT);
            } else {
              Alert.alert('Alle Einträge wurden gelöscht');
            }
          },
        },
      ]
    );
  };  
  

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
  
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  
    // const newEntry = {
    //   id: Date.now().toString(),
    //   type: type,
    //   category: category,
    //   amount: parseFloat(amount),
    //   image: image,
    // };
  
  //   const updatedEntries = [newEntry, ...entries];
  //   setEntries(updatedEntries);  // <- HIER!
  
  //   // 🔐 Direkt danach: speichern
  //   await AsyncStorage.setItem('entries', JSON.stringify(updatedEntries));
  
  //   setAmount('');
  //   setImage(null);
  
  //   if (Platform.OS === 'android') {
  //     ToastAndroid.show('Eintrag hinzugefügt', ToastAndroid.SHORT);
  //   } else {
  //     Alert.alert('Hinzugefügt', 'Eintrag wurde gespeichert.');
  //   }
  // };
  

  const handleAdd = async () => {
    if (!amount) return;
  
    const newEntry = {
      id: Date.now().toString(),
      type: type,
      category: category,
      amount: parseFloat(amount),
      image: image,
      date: date.toISOString(),

    };
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);  // <- HIER!
  
    // 🔐 Direkt danach: speichern
    await AsyncStorage.setItem('entries', JSON.stringify(updatedEntries));
  
    setAmount('');
    setImage(null);
  
    // 📣 Kurzer Hinweis
    if (Platform.OS === 'android') {
      ToastAndroid.show('Eintrag hinzugefügt', ToastAndroid.SHORT);
    } else {
      Alert.alert('Hinzugefügt', 'Eintrag wurde gespeichert.');
    }
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Beleg-App</Text>
      <View style={styles.summary}>
  <Text style={styles.income}>Einnahmen: {totalIncome.toFixed(2)} €</Text>
  <Text style={styles.expense}>Ausgaben: {totalExpense.toFixed(2)} €</Text>
  <Text style={styles.balance}>
    Bilanz: {totalBalance.toFixed(2)} €
  </Text>
  {/* <View style={{ marginTop: 30 }}>
  <Button
    title="Alle Einträge löschen"
    color="#d9534f"
    onPress={handleClearAll}
  />
</View> */}
{entries.length > 0 && (
  <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
    <Text style={styles.clearButtonText}>Alle Einträge löschen</Text>
  </TouchableOpacity>
)}
</View>

      <View style={styles.typeToggle}>
        <Button
          title="Ausgabe"
          onPress={() => setType('Ausgabe')}
          color={type === 'Ausgabe' ? '#d9534f' : '#ccc'}
        />
        <Button
          title="Einnahme"
          onPress={() => setType('Einnahme')}
          color={type === 'Einnahme' ? '#5cb85c' : '#ccc'}
        />
      </View>
      <View style={styles.categoryContainer}>
  <Text style={styles.label}>Kategorie:</Text>
  <View style={styles.categoryButtons}>
  {[
  { name: 'Geschäftsessen', icon: 'restaurant' },
  { name: 'Technik', icon: 'devices' },
  { name: 'Reisen', icon: 'flight' },
  { name: 'Sonstiges', icon: 'more-horiz' },
].map((cat) => (
  <TouchableOpacity
    key={cat.name}
    onPress={() => setCategory(cat.name)}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: category === cat.name ? '#007bff' : '#ccc',
      padding: 10,
      borderRadius: 5,
      marginRight: 5,
      marginBottom: 5,
    }}
  >
    <MaterialIcons name={cat.icon} size={20} color="#fff" />
    <Text style={{ color: '#fff', marginLeft: 5 }}>{cat.name}</Text>
  </TouchableOpacity>
))}

  </View>
</View>
<TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
  <Text style={styles.dateButtonText}>
    Datum: {date.toLocaleDateString()}
  </Text>
</TouchableOpacity>

{showDatePicker && (
  <DateTimePicker
    value={date}
    mode="date"
    display="default"
    onChange={(event, selectedDate) => {
      const currentDate = selectedDate || date;
      setShowDatePicker(false);
      setDate(currentDate);
    }}
  />
)}



<TextInput
  style={styles.input}
  placeholder="Betrag eingeben"
  keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
  value={amount}
  onChangeText={(text) => setAmount(text.replace(',', '.'))}
/>

<Button title="Beleg auswählen" onPress={pickImage} />
{image && (
  <Image source={{ uri: image }} style={{ width: 200, height: 200, marginVertical: 10 }} />
)}

      <Button title="Hinzufügen" onPress={handleAdd} />
      <View style={{ marginBottom: 10 }}>
  <Text>Typ filtern:</Text>
  <View style={{ flexDirection: 'row', gap: 10, marginVertical: 5 }}>
    {['Alle', 'Einnahme', 'Ausgabe'].map((type) => (
      <Button
        key={type}
        title={type}
        onPress={() => setFilterType(type)}
        color={filterType === type ? '#5cb85c' : '#ccc'}
      />
    ))}
  </View>

  <Text>Kategorie filtern:</Text>
  <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginVertical: 5 }}>
    {['Alle', 'Geschäftsessen', 'Technik', 'Reisen', 'Sonstiges'].map((cat) => (
      <Button
        key={cat}
        title={cat}
        onPress={() => setFilterCategory(cat)}
        color={filterCategory === cat ? '#007bff' : '#ccc'}
      />
    ))}
  </View>

  <Text>Sortieren nach:</Text>
  <View style={{ flexDirection: 'row', gap: 10, marginVertical: 5 }}>
    {['Datum', 'Betrag'].map((mode) => (
      <Button
        key={mode}
        title={mode}
        onPress={() => setSortMode(mode)}
        color={sortMode === mode ? '#333' : '#ccc'}
      />
    ))}
  </View>
</View>

      <FlatList
  data={filteredEntries}
  keyExtractor={(item) => item.id}
  style={{ marginTop: 20 }}
  renderItem={({ item }) => (
    <View style={{ marginBottom: 10 }}>
     <TouchableOpacity
  style={styles.deleteButton}
  onPress={() => handleDelete(item.id)}
>
  <Text style={styles.deleteButtonText}>Löschen</Text>
</TouchableOpacity>
<View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <MaterialIcons
    name={getCategoryIcon(item.category)}
    size={20}
    color="#555"
    style={{ marginRight: 5 }}
  />
  <Text style={styles.entry}>
    {item.type} ({item.category}): {item.amount.toFixed(2)} €
  </Text>
</View>


{item.image && (
  <TouchableOpacity
    onPress={() => Alert.alert('Bild', 'Hier könntest du z. B. eine Zoom-Ansicht öffnen.')}
  >
    <Image
      source={{ uri: item.image }}
      style={{ width: 100, height: 100, marginTop: 5 }}
    />
  </TouchableOpacity>
)}
<Text style={{ color: '#888' }}>
  Datum: {new Date(item.date).toLocaleDateString()}
</Text>
    </View>
  )}
/>
{zoomedImage && (
  <View style={styles.modalBackground}>
    <TouchableOpacity onPress={() => setZoomedImage(null)} style={styles.modalClose}>
      <Text style={{ color: '#fff', fontSize: 16 }}>Schließen</Text>
    </TouchableOpacity>
    <Image source={{ uri: zoomedImage }} style={styles.modalImage} />
  </View>
  )}

<View style={{ marginTop: 30 }}>
  <Button
    title="Alle Einträge löschen"
    color="#d9534f"
    onPress={handleClearAll}
  />
</View>

</View>  
  );
}
// <View style={{ marginTop: 30 }}>
//   <Button
//     title="Alle Einträge löschen"
//     color="#d9534f"
//     onPress={handleClearAll}
//   />
// </View>




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  typeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  categoryContainer: {
    marginBottom: 10,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  entry: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    fontSize: 16,
  },
  summary: {
    marginBottom: 20,
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 8,
  },
  income: {
    color: '#5cb85c',
    fontWeight: 'bold',
    fontSize: 16,
  },
  expense: {
    color: '#d9534f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  balance: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },  
  clearButton: {
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },  
  deleteButton: {
    marginTop: 5,
    backgroundColor: '#dc3545',
    padding: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalImage: {
    width: '90%',
    height: '60%',
    resizeMode: 'contain',
  },
  modalClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1000,
  },
  dateButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },  
});
