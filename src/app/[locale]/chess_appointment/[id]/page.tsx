"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FaShoppingCart } from "react-icons/fa";
import axios from "axios";

interface ChessBooking {
  durationInHours: number;
  endDate: string;
  gameType: {
    typeId: number;
    typeName: string;
    gameExtensions: any[];
  };
  gameTypeId: number;
  gameTypePrice: number;
  roomId: number;
  roomName: string;
  roomType: string;
  roomTypePrice: number;
  startDate: string;
  tableId: number;
  totalPrice: number;
  tableNumber: number;
  imageUrl?: string;
}

const TableDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { locale } = useParams();
  const searchParams = useSearchParams();
  const [chessBooking, setChessBooking] = useState<ChessBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchTableDetails = async () => {
      try {
        setLoading(true);
        const startTime = searchParams.get("startTime");
        const endTime = searchParams.get("endTime");

        const response = await axios.get(
          `https://backend-production-5bc5.up.railway.app/api/tables/${id}`,
          {
            params: {
              startTime: startTime ? decodeURIComponent(startTime) : undefined,
              endTime: endTime ? decodeURIComponent(endTime) : undefined,
            },
          },
        );

        const data = response.data;
        const bookingWithImage = {
          ...data,
          imageUrl: getImageByGameType(data.gameType.typeName),
        };
        setChessBooking(bookingWithImage);
      } catch (error) {
        console.error("Error fetching table details:", error);
        setError("Failed to load table details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTableDetails();
  }, [id, searchParams]);

  const getImageByGameType = (typeName: string) => {
    const type = typeName.toLowerCase();

    if (type.includes("chess") || type.includes("cờ vua")) {
      return "https://i.pinimg.com/736x/2e/7e/e5/2e7ee58125c4b42cc7387887eb350580.jpg";
    }
    if (type.includes("xiangqi") || type.includes("cờ tướng")) {
      return "https://i.pinimg.com/736x/82/82/02/828202dd07ec09743fd06f7e0659ae0c.jpg";
    }
    if (type.includes("go") || type.includes("cờ vây")) {
      return "https://i.pinimg.com/736x/06/31/18/063118e78b9950a9ef9c97aa4b46c1c2.jpg";
    }
    return "https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg";
  };

  const getPrivilegesByRoomType = (roomType: string) => {
    switch (roomType.toLowerCase()) {
      case "premium":
        return [
          "Miễn phí nước uống cao cấp",
          "Hỗ trợ tư vấn cờ từ kiện tướng",
          "Không gian VIP riêng tư",
          "Wifi tốc độ cao",
          "Bàn cờ cao cấp",
          "Đồ ăn nhẹ miễn phí",
        ];
      case "basic":
        return [
          "Miễn phí nước uống cơ bản",
          "Hỗ trợ tư vấn cờ cơ bản",
          "Không gian yên tĩnh",
          "Wifi miễn phí",
          "Bàn cờ tiêu chuẩn",
        ];
      case "openspace":
        return [
          "Không gian mở thoáng đãng",
          "Khu vực chung rộng rãi",
          "Wifi miễn phí",
          "Bàn cờ tiêu chuẩn",
          "Dễ dàng giao lưu",
        ];
      default:
        return [
          "Miễn phí nước uống",
          "Hỗ trợ tư vấn cờ",
          "Không gian yên tĩnh",
          "Wifi miễn phí",
        ];
    }
  };

  const GAME_TYPE_TRANSLATIONS: Record<string, string> = {
    chess: "Cờ Vua",
    xiangqi: "Cờ Tướng",
    go: "Cờ Vây",
  };

  const translateRoomType = (roomType: string): string => {
    const type = roomType.toLowerCase();

    if (type.includes("basic")) return "Phòng thường";
    if (type.includes("premium")) return "Phòng cao cấp";
    if (type.includes("openspace") || type.includes("open space"))
      return "Không gian mở";

    return roomType;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!chessBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">No table data found</div>
      </div>
    );
  }

  const startDate = new Date(chessBooking.startDate);
  const endDate = new Date(chessBooking.endDate);

  const formattedDate = startDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const privileges = getPrivilegesByRoomType(chessBooking?.roomType || "");

  return (
    <div>
      <Navbar></Navbar>
      <div className="relative font-sans">
        <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>
        <img
          src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
        <div className="min-h-[300px] relative z-30 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
          <h2 className="sm:text-3xl text-xl font-bold mb-4">
            Cửa hàng cờ StrateZone
          </h2>
          <p className="sm:text-base text-sm text-center text-gray-200">
            Nâng tầm chiến thuật – Trang bị như một kiện tướng!
          </p>
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 transform scale-95 origin-top">
        <div className="max-w-4xl mx-auto">
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-gray-900 text-center uppercase tracking-wider ">
              Thông Tin Bàn Chi Tiết
            </h1>
          </div>
          <div className="w-8"></div>

          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              <div className="relative group overflow-hidden rounded-md">
                <img
                  src={chessBooking.imageUrl}
                  alt="Bàn cờ"
                  className="w-full h-64 object-cover transition duration-300 group-hover:scale-105"
                />
              </div>

              <div className="space-y-3 text-black">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-black">
                      {GAME_TYPE_TRANSLATIONS[
                        chessBooking.gameType.typeName.toLowerCase()
                      ] || chessBooking.gameType.typeName}
                    </h2>
                    <span className="text-gray-700 text-sm">
                      <span className="text-gray-700">Mã Bàn:</span>{" "}
                      <span className="text-black font-medium">
                        {chessBooking.tableId}
                      </span>{" "}
                      - <span className="text-gray-700">Phòng Số:</span>{" "}
                      <span className="text-black font-medium">
                        {chessBooking.roomId}
                      </span>
                    </span>

                    <p className="text-gray-700 text-sm">
                      <span className="text-gray-700">Ngày:</span>{" "}
                      <span className="text-black font-medium">
                        {formattedDate}
                      </span>
                    </p>

                    <p className="text-gray-700 text-sm">
                      <span className="text-gray-700">Giờ Bắt Đầu:</span>{" "}
                      <span className="text-black font-medium">
                        {startDate.getHours()}:
                        {startDate.getMinutes().toString().padStart(2, "0")}
                      </span>
                    </p>

                    <p className="text-gray-700 text-sm">
                      <span className="text-gray-700">Giờ Kết Thúc:</span>{" "}
                      <span className="text-black font-medium">
                        {endDate.getHours()}:
                        {endDate.getMinutes().toString().padStart(2, "0")}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-700">Thành Tiền</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {chessBooking.totalPrice.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>

                <div className="border-t border-b border-gray-200 py-3 my-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Giá Của Loại Cờ</p>
                      <p className="font-medium text-sm">
                        {chessBooking.gameTypePrice.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Giá Phòng</p>
                      <p className="font-medium text-sm">
                        {chessBooking.roomTypePrice.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Giá Thuê Theo Giờ</p>
                      <p className="font-medium text-sm">
                        {(
                          chessBooking.roomTypePrice +
                          chessBooking.gameTypePrice
                        ).toLocaleString("vi-VN")}
                        đ
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Tổng Thời Gian Thuê Bàn
                      </p>
                      <p className="font-medium text-sm">
                        {chessBooking.durationInHours} giờ
                      </p>
                    </div>
                    <div>
                      <div>
                        <p className="text-xs text-gray-500">Loại Phòng</p>
                        <p className="font-medium text-sm">
                          {translateRoomType(chessBooking.roomType)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-1">
                    Tiện ích phòng
                  </h3>
                  <div className="grid grid-cols-2 gap-1">
                    {privileges.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-4 h-4 bg-amber-100 rounded-full flex items-center justify-center mr-1">
                          <svg
                            className="w-2.5 h-2.5 text-amber-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-black text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="gradient"
                    color="amber"
                    className="flex-1 py-2 text-sm"
                    onClick={() =>
                      router.push(
                        `/${locale}/chess_appointment/chess_appointment_order`,
                      )
                    }
                  >
                    Thêm Vào Danh Sách
                  </Button>
                  <Button
                    variant="text"
                    color="gray"
                    className="flex items-center gap-1 text-sm"
                    onClick={() => router.back()}
                  >
                    <FaShoppingCart size={14} />
                    Tiếp Tục Chọn Bàn
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default TableDetailsPage;
