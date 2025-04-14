"use client";
import Banner from "@/components/banner/banner";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { DefaultPagination } from "@/components/pagination";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Thread {
  threadId: number;
  createdBy: number;
  title: string;
  thumbnailUrl: string | null;
  content: string;
  rating: number;
  likesCount: number;
  status: "pending" | "published" | "rejected";
  createdAt: string;
  updatedAt: string | null;
  comments: Comment[];
  createdByNavigation: {
    userId: number;
    username: string;
    avatarUrl: string;
  };
  threadsTags: {
    id: number;
    tagId: number;
    tag: {
      tagId: number;
      tagName: string;
    };
  }[];
}

interface Comment {
  commentId: number;
  content: string;
  createdAt: string;
}

interface ApiResponse {
  pagedList: Thread[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

function BlogHistory() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();
  const pageSize = 4; // Made this a constant since it doesn't change

  useEffect(() => {
    // Check for auth data on client side
    const authDataString = localStorage.getItem("authData");
    if (!authDataString) {
      alert("Please login to view your blog history");
      router.push("/login");
      return;
    }

    try {
      const authData = JSON.parse(authDataString);
      if (authData && authData.userId) {
        setUserId(authData.userId);
      } else {
        throw new Error("Invalid auth data");
      }
    } catch (error) {
      console.error("Error parsing auth data:", error);
      alert("Invalid authentication data. Please login again.");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchThreads = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/threads/user/${userId}?page-number=${currentPage}&page-size=${pageSize}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch threads");
        }

        const data: ApiResponse = await response.json();
        setThreads(data.pagedList);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error("Error fetching threads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [userId, currentPage]); // Removed pageSize from dependencies since it's constant

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Published
          </span>
        );
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Rejected
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (threadId: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(
          `https://backend-production-ac5e.up.railway.app/api/threads/${threadId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          // Refetch threads to update the list
          setCurrentPage(1); // Reset to first page after deletion
        } else {
          alert("Failed to delete post");
        }
      } catch (error) {
        console.error("Error deleting thread:", error);
      }
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading user data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Banner
        title="My Blog History"
        subtitle="View and manage all your blog posts"
      />

      <div className="container mx-auto px-4 py-8 flex-grow">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Your Blog Posts ({totalCount})
              </h2>
              <p className="text-gray-600">
                All your submitted posts and their current status
              </p>
            </div>

            <div className="space-y-6">
              {threads.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    You haven't written any blog posts yet.
                  </p>
                  <Link
                    href="/create-blog"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                  >
                    Write your first blog post
                  </Link>
                </div>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.threadId}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            <Link
                              href={`/blog/${thread.threadId}`}
                              className="hover:text-blue-600"
                            >
                              {thread.title}
                            </Link>
                          </h3>
                          <div className="flex items-center space-x-4 mb-3">
                            {getStatusBadge(thread.status)}
                            <span className="text-sm text-gray-500">
                              Posted on: {formatDate(thread.createdAt)}
                            </span>
                            {thread.updatedAt && (
                              <span className="text-sm text-gray-500">
                                Last updated: {formatDate(thread.updatedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {thread.comments.length} comments
                          </span>
                          <span className="text-sm text-gray-500">
                            {thread.likesCount} likes
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {thread.content}
                      </p>

                      {thread.threadsTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {thread.threadsTags.map((tag) => (
                            <span
                              key={tag.id}
                              className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                            >
                              {tag.tag.tagName}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="relative w-8 h-8 mr-2">
                            <Image
                              src={
                                thread.createdByNavigation.avatarUrl ||
                                "/default-avatar.png"
                              }
                              alt={thread.createdByNavigation.username}
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {thread.createdByNavigation.username}
                          </span>
                        </div>
                        <div className="space-x-2">
                          <Link
                            href={`/blog/${thread.threadId}/edit`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(thread.threadId)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 mb-8">
                <DefaultPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default BlogHistory;
