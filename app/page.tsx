"use client";
import { useEffect, useState } from "react";
import { IVideo } from "@/models/Video";
import { apiClient } from "@/lib/api-client";
import Header from "./components/Headers";
import VideoFeed from "./components/VideoFeed";
import { useNotification } from "./components/Notification";

export default function Home() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const fetchedVideos = await apiClient.getVideos();
        setVideos(fetchedVideos);
      } catch (error) {
        showNotification("Failed to fetch videos", "error");
      }
    };

    fetchVideos();
  }, [showNotification]);

  return (
    <div className="min-h-screen bg-base-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <VideoFeed videos={videos} />
      </main>
    </div>
  );
}