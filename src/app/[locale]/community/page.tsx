"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  ButtonGroup,
  Typography,
  Chip,
} from "@material-tailwind/react";
import Navbar from "@/components/navbar";
import CommunityCard from "@/components/card/community_card";
import SearchInput from "@/components/input/search_input";
import Footer from "@/components/footer";
import Banner from "@/components/banner/banner";
import { useParams, useRouter } from "next/navigation";
import { DefaultPagination } from "@/components/pagination";

interface ThreadTag {
  id: number;
  tag?: {
    tagId: number;
    tagName: string;
  };
}

interface Thread {
  threadId: number;
  title: string;
  thumbnailUrl: string;
  content: string;
  createdAt: string;
  likesCount: number;
  threadsTags?: ThreadTag[];
  createdByNavigation: {
    userId: number;
    fullName: string;
    avatarUrl: string;
  };
  likes?: Array<{ id: number; userId: number | null }>;
}

interface Tag {
  tagId: number;
  tagName: string;
  description?: string;
  postCount: number;
}

interface PaginatedResponse {
  pagedList: Thread[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export default function ComunityPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagLoading, setTagLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const router = useRouter();
  const { locale } = useParams();

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setLoading(true);
        let url = `https://backend-production-ac5e.up.railway.app/api/threads/filter/statuses-and-tags?statuses=published&page-number=${currentPage}&page-size=${pageSize}`;

        if (selectedTags.length > 0) {
          // Add each tagId as a separate parameter
          selectedTags.forEach((tagId) => {
            url += `&TagIds=${tagId}`;
          });
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch threads");
        const data: PaginatedResponse = await response.json();
        setThreads(data.pagedList || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching threads:", error);
        setThreads([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchTags = async () => {
      try {
        setTagLoading(true);
        const response = await fetch(
          "https://backend-production-ac5e.up.railway.app/api/tags"
        );
        if (!response.ok) throw new Error("Failed to fetch tags");
        const data: Tag[] = await response.json();
        setTags(data || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setTags([]);
      } finally {
        setTagLoading(false);
      }
    };

    fetchThreads();
    fetchTags();
  }, [currentPage, pageSize, selectedTags]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const toggleTag = (tagId: number) => {
    setCurrentPage(1);
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const cleanAndTruncate = (html: string, maxLength: number = 200) => {
    if (!html) return "";
    const plainText = html.replace(/<[^>]*>/g, "");
    const normalizedText = plainText.replace(/\s+/g, " ").trim();
    if (normalizedText.length <= maxLength) return normalizedText;
    let truncated = normalizedText.substr(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(" ");
    if (lastSpaceIndex > maxLength * 0.7) {
      truncated = truncated.substr(0, lastSpaceIndex);
    }
    return truncated + "...";
  };

  return (
    <div>
      <Navbar />
      <Banner
        title="Tham Gia Cộng Đồng Chơi Cờ"
        subtitle="Kết nối với những người đam mê cờ vua, tham gia các giải đấu và cải thiện kỹ năng của bạn tại StrateZone!"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full lg:w-3/4 px-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <ButtonGroup variant="text" className="flex md:flex-row flex-col">
                <Button>Mới Nhất</Button>
                <Button>Phổ Biến</Button>
                <Button>Bài Viết Của Bạn Bè</Button>
              </ButtonGroup>

              <Button
                onClick={() => router.push(`/${locale}/community/create_post`)}
                variant="filled"
                className="md:ml-4"
              >
                Tạo Bài Viết
              </Button>
            </div>

            <div
              className="w-full h-px max-w-6xl mx-auto my-3"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(128, 128, 128, 0) 1.46%, rgba(128, 128, 128, 0.6) 40.83%, rgba(128, 128, 128, 0.3) 65.57%, rgba(128, 128, 128, 0) 107.92%)",
              }}
            ></div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (threads?.length || 0) === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-lg">Không có bài viết nào.</p>
              </div>
            ) : (
              <>
                {threads?.map((thread) => (
                  <CommunityCard
                    key={thread.threadId}
                    threadId={thread.threadId}
                    theme={thread.threadsTags?.[0]?.tag?.tagName || "Chess"}
                    title={thread.title}
                    thumbnailUrl={thread.thumbnailUrl}
                    description={cleanAndTruncate(thread.content)}
                    dateTime={thread.createdAt}
                    likes={thread.likesCount || 0}
                    threadData={{
                      likes: (thread.likes || []).map((like) => ({
                        ...like,
                        threadId: thread.threadId,
                      })),
                    }}
                    createdByNavigation={{
                      ...thread.createdByNavigation,
                      username: thread.createdByNavigation.fullName
                        .replace(/\s+/g, "")
                        .toLowerCase(), // Example username generation
                    }}
                    tags={thread.threadsTags || []}
                  />
                ))}

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

          <div className="w-full lg:w-1/4 px-4">
            <SearchInput />

            <Typography variant="h4" className="my-4 text-black">
              Chọn Chủ Đề
            </Typography>

            {selectedTags.length > 0 && (
              <div className="mb-4">
                <Typography variant="small" className="mb-2 text-black">
                  Đang lọc theo:
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {tags
                    .filter((tag) => selectedTags.includes(tag.tagId))
                    .map((tag) => (
                      <Chip
                        key={tag.tagId}
                        value={tag.tagName}
                        onClose={() => toggleTag(tag.tagId)}
                        className="cursor-pointer"
                      />
                    ))}
                  <Button
                    variant="text"
                    size="sm"
                    onClick={() => setSelectedTags([])}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Xóa tất cả
                  </Button>
                </div>
              </div>
            )}

            {tagLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag) => (
                  <Chip
                    key={tag.tagId}
                    value={`${tag.tagName} (${tag.postCount || 0})`}
                    onClose={() => toggleTag(tag.tagId)}
                    variant={
                      selectedTags.includes(tag.tagId) ? "filled" : "outlined"
                    }
                    color={selectedTags.includes(tag.tagId) ? "blue" : "gray"}
                    className="cursor-pointer hover:shadow-md transition-all"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
