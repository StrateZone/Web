"use client";

import Banner from "@/components/banner/banner";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import React, { useState, useEffect, useCallback } from "react";
import { User, FriendList } from "@/types";
import { useRouter } from "next/navigation";

type FriendRequest = {
  id: number;
  fromUser: number;
  toUser: number;
  status: string;
  createdAt: string;
  fromUserNavigation: User; // This is the sender
  toUserNavigation: User; // This is the receiver
};

export default function FriendManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friendList, setFriendList] = useState<FriendList[]>([]);
  const [activeTab, setActiveTab] = useState("friends");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);

  // Load userId from localStorage on initial render
  useEffect(() => {
    const authDataString = localStorage.getItem("authData");
    if (!authDataString) {
      router.push("/login");
      return;
    }

    try {
      const authData = JSON.parse(authDataString);
      if (authData.userId) {
        setUserId(authData.userId);
      } else {
        throw new Error("userId not found in auth data");
      }
    } catch (error) {
      console.error("Error parsing auth data:", error);
      router.push("/login");
    }
  }, [router]);

  // Memoized function to load friend requests
  const loadFriendRequests = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/friendrequests/to/${userId}`
      );
      const data = await response.json();
      setFriendRequests(data.pagedList || []);
    } catch (err) {
      setError("Failed to load friend requests");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Memoized function to load friend list
  const loadFriendList = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/friendlists/user/${userId}`
      );
      const data = await response.json();
      setFriendList(data.pagedList || []);
    } catch (err) {
      setError("Failed to load friend list");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load data when userId changes
  useEffect(() => {
    if (userId) {
      loadFriendList();
      loadFriendRequests();
    }
  }, [userId, loadFriendList, loadFriendRequests]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/users/username/search?username=${searchTerm}`
      );
      const data = await response.json();
      setSearchResults(data.pagedList);
      setActiveTab("search");
    } catch (err) {
      setError("Failed to search users");
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (targetUserId: number) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/friendrequests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: userId,
            receiverId: targetUserId,
          }),
        }
      );

      if (response.ok) {
        alert("Friend request sent successfully");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send request");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    }
  };

  const acceptFriendRequest = async (requestId: number) => {
    try {
      // Optimistic update - remove from UI immediately
      setFriendRequests((prev) =>
        prev.filter((request) => request.id !== requestId)
      );

      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/friendrequests/accept/${requestId}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept request");
      }

      // Reload both lists to ensure data consistency
      await loadFriendRequests();
      await loadFriendList();
    } catch (err) {
      // If error, reload requests to restore correct state
      loadFriendRequests();
      setError(err instanceof Error ? err.message : "Failed to accept request");
    }
  };

  const rejectFriendRequest = async (requestId: number) => {
    try {
      // Optimistic update - remove from UI immediately
      setFriendRequests((prev) =>
        prev.filter((request) => request.id !== requestId)
      );

      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/friendrequests/reject/${requestId}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject request");
      }

      // Reload requests to ensure data consistency
      await loadFriendRequests();
    } catch (err) {
      // If error, reload requests to restore correct state
      loadFriendRequests();
      setError(err instanceof Error ? err.message : "Failed to reject request");
    }
  };

  // Filter to only show pending requests
  const pendingRequests = friendRequests.filter(
    (request) => request.status === "pending"
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Banner title="Friend Management" subtitle="Connect with other players" />

      <div className="container mx-auto px-4 py-8 flex-grow text-black">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex">
            <input
              type="text"
              placeholder="Search by username..."
              className="flex-grow p-2 border border-gray-300 rounded-l"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === "friends" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("friends")}
          >
            Friends ({friendList.length})
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === "requests" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("requests")}
          >
            Requests ({pendingRequests.length})
          </button>
          {searchResults.length > 0 && (
            <button
              className={`py-2 px-4 font-medium ${activeTab === "search" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500"}`}
              onClick={() => setActiveTab("search")}
            >
              Search Results
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Content based on active tab */}
        <div>
          {activeTab === "friends" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Friends</h2>
              {isLoading ? (
                <p>Loading friends...</p>
              ) : friendList.length === 0 ? (
                <p>You don't have any friends yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friendList.map((friendItem) => (
                    <FriendCard
                      key={friendItem.id}
                      user={friendItem.friend}
                      isFriend={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
              {isLoading ? (
                <p>Loading requests...</p>
              ) : pendingRequests.length === 0 ? (
                <p>You don't have any pending friend requests.</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border p-4 rounded-lg flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <img
                          src={
                            request.fromUserNavigation?.avatarUrl ||
                            "https://i.pinimg.com/736x/0f/68/94/0f6894e539589a50809e45833c8bb6c4.jpg"
                          }
                          alt={
                            request.fromUserNavigation?.username ||
                            "Unknown User"
                          }
                          className="w-12 h-12 rounded-full mr-4"
                        />

                        <div>
                          <h3 className="font-medium">
                            {request.fromUserNavigation.username}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Sent on{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => acceptFriendRequest(request.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectFriendRequest(request.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "search" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Search Results</h2>
              {isLoading ? (
                <p>Searching...</p>
              ) : searchResults.length === 0 ? (
                <p>No users found matching your search.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((user) => (
                    <FriendCard
                      key={user.userId}
                      user={user}
                      isFriend={false}
                      onAddFriend={() => sendFriendRequest(user.userId)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FriendCard({
  user,
  isFriend,
  onAddFriend,
}: {
  user: User;
  isFriend: boolean;
  onAddFriend?: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow text-black">
      <div className="flex items-center mb-3">
        <img
          src={user.avatarUrl || "/default-avatar.png"}
          alt={user.username}
          className="w-16 h-16 rounded-full mr-4"
        />
        <div>
          <h3 className="font-semibold">{user.username}</h3>
          <p className="text-sm text-gray-500">
            {user.fullName || "No name provided"}
          </p>
        </div>
      </div>
      <div className="text-sm mb-3">
        <p>Skill: {user.skillLevel || "Not specified"}</p>
        <p>Points: {user.points}</p>
      </div>
      {isFriend ? (
        <button className="w-full bg-gray-200 text-gray-800 py-1 rounded hover:bg-gray-300">
          Friends
        </button>
      ) : (
        <button
          onClick={onAddFriend}
          className="w-full bg-blue-500 text-white py-1 rounded hover:bg-blue-600"
        >
          Add Friend
        </button>
      )}
    </div>
  );
}
