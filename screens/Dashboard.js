import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function DashboardScreen({ navigation, route }) {
  const { user, logout } = useContext(AuthContext);
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState(true);

  const subjects = ["all", ...new Set(materials.map((m) => m.subject))];

  useEffect(() => {
    if (user?.token) fetchMaterials();
  }, [user]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://your-backend-url.com/api/courses", {
        headers: { "x-auth-token": user.token },
      });
      setMaterials(res.data);
    } catch (err) {
      console.log("Gagal ambil materi:", err.message);
      Alert.alert("Error", "Gagal mengambil materi");
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === "all" || material.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleLogout = () => {
    logout();
    Alert.alert("Success", "Berhasil logout");
    navigation.navigate("Login");
  };

  const getDifficultyLabelColor = (difficulty) => {
    switch (difficulty) {
      case "Mudah":
        return { backgroundColor: "#D1FAE5", color: "#065F46" };
      case "Menengah":
        return { backgroundColor: "#FEF3C7", color: "#B45309" };
      case "Sulit":
        return { backgroundColor: "#FEE2E2", color: "#B91C1C" };
      default:
        return { backgroundColor: "#E5E7EB", color: "#374151" };
    }
  };

  if (loading)
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 10, color: "#6B7280", fontWeight: "500" }}>
          Menyiapkan materi belajarmu...
        </Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>
              Siap Taklukkan Ujian, {user?.name?.split(" ")[0]}?
            </Text>
            <Text style={styles.subWelcome}>
              Terdaftar sebagai {user?.school || "Sekolahmu"}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={{ color: "white", fontWeight: "bold" }}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Cari topik spesifik..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>

        {/* Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 15 }}
        >
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject}
              onPress={() => setSelectedSubject(subject)}
              style={[
                styles.filterBtn,
                selectedSubject === subject && styles.filterBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedSubject === subject && { color: "white" },
                ]}
              >
                {subject === "all" ? "Semua Materi" : subject}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Materials List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredMaterials.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Materi Tidak Ditemukan</Text>
            <Text style={styles.emptySubText}>
              Coba gunakan kata kunci atau filter lain
            </Text>
          </View>
        ) : (
          filteredMaterials.map((material) => (
            <TouchableOpacity
              key={material._id}
              style={styles.materialCard}
              onPress={() =>
                navigation.navigate("MaterialDetail", {
                  materialId: material._id,
                })
              }
            >
              <View style={styles.materialHeader}>
                <Text
                  style={[
                    styles.subjectBadge,
                    { backgroundColor: "#DBEAFE", color: "#1D4ED8" },
                  ]}
                >
                  {material.subject}
                </Text>
                <Text
                  style={[
                    styles.difficultyBadge,
                    getDifficultyLabelColor(material.difficulty),
                  ]}
                >
                  {material.difficulty}
                </Text>
              </View>
              <Text style={styles.materialTitle}>{material.title}</Text>
              <Text style={styles.materialDesc} numberOfLines={3}>
                {material.description}
              </Text>
              <View style={styles.materialFooter}>
                <Text style={styles.footerText}>{material.duration}</Text>
                <Text style={styles.footerText}>
                  {material.topics?.length || 0} Topik
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: { color: "white", fontSize: 22, fontWeight: "bold" },
  subWelcome: { color: "#9CA3AF", fontSize: 14, marginTop: 3 },
  logoutBtn: { backgroundColor: "#EF4444", padding: 10, borderRadius: 12 },
  searchBar: {
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 15,
    height: 50,
    paddingHorizontal: 15,
  },
  searchInput: { flex: 1, fontSize: 16 },
  filterBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "white",
    borderRadius: 12,
    marginRight: 10,
  },
  filterBtnActive: { backgroundColor: "#3B82F6" },
  filterText: { fontWeight: "bold", color: "#6B7280" },
  scrollContent: { padding: 20 },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 5,
  },
  emptySubText: { fontSize: 14, color: "#9CA3AF" },
  materialCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },
  materialHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  subjectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 12,
  },
  materialTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  materialDesc: { color: "#6B7280", fontSize: 14 },
  materialFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  footerText: { fontSize: 12, color: "#9CA3AF", fontWeight: "bold" },
});
