import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function MaterialDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { id } = route.params;

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedMaterials, setRelatedMaterials] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://diy-karang-taruna.vercel.app/api/courses/${id}`,
        );
        setMaterial(res.data);

        const allRes = await axios.get(
          "https://diy-karang-taruna.vercel.app/api/courses",
        );
        const related = allRes.data
          .filter(
            (m) => m.subject === res.data.subject && m._id !== res.data._id,
          )
          .slice(0, 3);
        setRelatedMaterials(related);
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Gagal mengambil materi.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Mudah":
        return "#A7F3D0";
      case "Menengah":
        return "#FDE68A";
      case "Sulit":
        return "#FCA5A5";
      default:
        return "#E5E7EB";
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ marginTop: 10 }}>Memuat materi pembelajaran...</Text>
      </View>
    );
  }

  if (!material) {
    return (
      <View style={styles.loader}>
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
          Materi tidak ditemukan
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: "#6366F1", marginTop: 10 }}>
            Kembali ke Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Material Card */}
      <View style={styles.card}>
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}
        >
          <Text
            style={[
              styles.badge,
              { backgroundColor: "#DBEAFE", color: "#1E40AF" },
            ]}
          >
            {material.subject}
          </Text>
          <Text
            style={[
              styles.badge,
              {
                backgroundColor: getDifficultyColor(material.difficulty),
                color: "#1E3A8A",
              },
            ]}
          >
            {material.difficulty}
          </Text>
        </View>
        <Text style={styles.title}>{material.title}</Text>
        <Text style={styles.description}>{material.description}</Text>

        <View style={styles.infoRow}>
          <Text>Durasi: {material.duration}</Text>
          <Text>Topik: {material.topics?.length || 0}</Text>
        </View>

        {/* Topik */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
            Topik yang Dibahas:
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {material.topics?.map((topic, idx) => (
              <Text key={idx} style={styles.topic}>
                {topic}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Konten Materi */}
      <View style={styles.card}>
        <Text style={{ marginBottom: 8, fontWeight: "bold" }}>
          Konten Materi:
        </Text>
        <Text style={{ lineHeight: 22 }}>{material.content}</Text>
      </View>

      {/* Related Materials */}
      {relatedMaterials.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 12 }}>
            Materi {material.subject} Lainnya
          </Text>
          {relatedMaterials.map((rm) => (
            <TouchableOpacity
              key={rm._id}
              style={styles.relatedCard}
              onPress={() => navigation.push("MaterialDetail", { id: rm._id })}
            >
              <Text
                style={[
                  styles.badge,
                  {
                    backgroundColor: getDifficultyColor(rm.difficulty),
                    color: "#1E3A8A",
                    marginBottom: 4,
                  },
                ]}
              >
                {rm.difficulty}
              </Text>
              <Text style={{ fontWeight: "bold" }}>{rm.title}</Text>
              <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>
                {rm.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Footer Buttons */}
      <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#F3F4F6" }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "#374151" }}>Kembali</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#6366F1" }]}
          onPress={() => navigation.scrollTo({ y: 0 })}
        >
          <Text style={{ color: "#FFF" }}>Baca Ulang</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  badge: {
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 8 },
  description: { fontSize: 14, color: "#4B5563", marginBottom: 8 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  topic: {
    backgroundColor: "#E0E7FF",
    color: "#1E3A8A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  relatedCard: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center" },
});
