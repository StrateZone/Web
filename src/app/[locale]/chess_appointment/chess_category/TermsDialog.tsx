import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button as MuiButton,
} from "@mui/material";

interface TermsDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function TermsDialog({ open, onClose }: TermsDialogProps) {
  const [refundHours, setRefundHours] = useState<number | null>(null);
  const [nonCancelableHours, setNonCancelableHours] = useState<number | null>(
    null
  );
  const [minutesBeforeCheckIn, setMinutesBeforeCheckIn] = useState<
    number | null
  >(null);
  const [contributionPoints_PerThread, setContributionPoints_PerThread] =
    useState<number | null>(null);
  const [contributionPoints_PerComment, setContributionPoints_PerComment] =
    useState<number | null>(null);
  const [
    userPoints_PerCheckinTable_ByPercentageOfTablesPrice,
    setUserPoints_PerCheckinTable_ByPercentageOfTablesPrice,
  ] = useState<number | null>(null);
  const [
    max_NumberOfTables_CancelPerWeek,
    setMax_NumberOfTables_CancelPerWeek,
  ] = useState<number | null>(null);
  const [
    numberof_TopContributors_PerWeek,
    setNumberof_TopContributors_PerWeek,
  ] = useState<number | null>(null);
  const [
    max_NumberOfUsers_InvitedToTable,
    setMax_NumberOfUsers_InvitedToTable,
  ] = useState<number | null>(null);
  const [
    appointmentRequest_MaxHours_UntilExpiration,
    setAppointmentRequest_MaxHours_UntilExpiration,
  ] = useState<number | null>(null);
  const [percentageRefundIfNotFull, setPercentageRefundIfNotFull] = useState<
    number | null
  >(null); // New state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSystemSettings = async () => {
      setIsLoading(true);
      try {
        // Fetch system settings
        const systemResponse = await fetch(
          "https://backend-production-ac5e.up.railway.app/api/system/1",
          {
            method: "GET",
            headers: {
              Accept: "*/*",
            },
          }
        );
        const systemData = await systemResponse.json();
        setRefundHours(systemData.appointment_Refund100_HoursFromScheduleTime);
        setNonCancelableHours(
          systemData.appointment_Incoming_HoursFromScheduleTime
        );
        setMinutesBeforeCheckIn(
          systemData.appointment_Checkin_MinutesFromScheduleTime
        );
        setContributionPoints_PerThread(
          systemData.contributionPoints_PerThread
        );
        setContributionPoints_PerComment(
          systemData.contributionPoints_PerComment
        );
        setUserPoints_PerCheckinTable_ByPercentageOfTablesPrice(
          systemData.userPoints_PerCheckinTable_ByPercentageOfTablesPrice
        );
        setMax_NumberOfTables_CancelPerWeek(
          systemData.max_NumberOfTables_CancelPerWeek
        );
        setNumberof_TopContributors_PerWeek(
          systemData.numberof_TopContributors_PerWeek
        );
        setMax_NumberOfUsers_InvitedToTable(
          systemData.max_NumberOfUsers_InvitedToTable
        );
        setAppointmentRequest_MaxHours_UntilExpiration(
          systemData.appointmentRequest_MaxHours_UntilExpiration
        );

        // Fetch percentage refund if not full
        const refundResponse = await fetch(
          "https://backend-production-ac5e.up.railway.app/api/system/1/percentage-refund-ifnotfull",
          {
            method: "GET",
            headers: {
              Accept: "*/*",
            },
          }
        );
        const refundData = await refundResponse.json();
        setPercentageRefundIfNotFull(refundData * 100); // Convert to percentage (e.g., 0.5 -> 50)
      } catch (error) {
        console.error("Error fetching system settings:", error);
        setRefundHours(3.5);
        setNonCancelableHours(1.5);
        setMinutesBeforeCheckIn(5);
        setContributionPoints_PerThread(35);
        setContributionPoints_PerComment(5);
        setUserPoints_PerCheckinTable_ByPercentageOfTablesPrice(0.002);
        setMax_NumberOfTables_CancelPerWeek(5);
        setNumberof_TopContributors_PerWeek(10);
        setMax_NumberOfUsers_InvitedToTable(6);
        setAppointmentRequest_MaxHours_UntilExpiration(48);
        setPercentageRefundIfNotFull(50); // Fallback for percentage refund
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemSettings();
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          background: "linear-gradient(to bottom right, #f8fafc, #e2e8f0)",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#e0e7ff",
          color: "#1e3a8a",
          fontWeight: "bold",
          fontSize: "1.5rem",
          padding: "16px 24px",
          borderBottom: "1px solid #c7d2fe",
        }}
      >
        Điều Khoản Sử Dụng
      </DialogTitle>
      <DialogContent
        sx={{
          padding: "24px",
          backgroundColor: "#f8fafc",
          color: "#334155",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        {isLoading ? (
          <Typography sx={{ color: "#475569", textAlign: "center", mt: 4 }}>
            Đang tải dữ liệu...
          </Typography>
        ) : (
          <>
            <Typography
              variant="h6"
              sx={{ fontWeight: "600", color: "#1e40af", mt: 2, mb: 1 }}
            >
              1. Quy Định Chung
            </Typography>
            <Typography
              paragraph
              sx={{ color: "#475569", lineHeight: "1.6", fontSize: "0.95rem" }}
            >
              - Hệ thống chỉ hỗ trợ các loại cờ có 2 người chơi: Cờ Vua, Cờ
              Tướng, Cờ Vây.
              <br />
              - Người dùng chỉ có thể chọn giờ chơi trong khoảng thời gian mở
              cửa và đóng cửa của hệ thống, được quy định bởi giờ mở và giờ đóng
              hàng ngày.
              <br />- Lời mời tham gia chơi chỉ có thể được gửi trong các khung
              thời gian cụ thể do hệ thống thiết lập.
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontWeight: "600", color: "#1e40af", mt: 2, mb: 1 }}
            >
              2. Đặt Bàn và Thanh Toán
            </Typography>
            <Typography
              paragraph
              sx={{ color: "#475569", lineHeight: "1.6", fontSize: "0.95rem" }}
            >
              - Tất cả dịch vụ chỉ có thể được thanh toán thông qua ví điện tử
              của hệ thống.
              <br />
              - Một lịch hẹn có thể được sử dụng để đặt nhiều bàn ở các khung
              giờ khác nhau.
              <br />
              - Không hỗ trợ đặt cọc; tất cả lịch hẹn phải được thanh toán đầy
              đủ khi xác nhận.
              <br />
              - Lời mời chỉ có thể được gửi sau khi lịch đặt bàn đã được thanh
              toán.
              <br />
              - Nếu đặt bàn có lời mời, hóa đơn sẽ được chia đều cho người gửi
              lời mời và những người được mời đã chấp nhận.
              <br />
              - Người dùng chấp nhận lời mời phải thanh toán phần còn lại của
              lịch đặt bàn đó.
              <br />- Mỗi bàn chỉ được gửi tối đa{" "}
              <strong className="text-indigo-700">
                {max_NumberOfUsers_InvitedToTable ?? "Lỗi hiển thị"}
              </strong>{" "}
              lời mời cùng lúc (không tính các lời mời bị từ chối, hết hạn,...),
              nhưng chỉ có 1 người được mời có thể chấp nhận lời mời. Khi chấp
              nhận lời mời thành công, những lời mời đã gửi khác sẽ tự động bị
              hủy.
              <br />- Thời hạn tối đa của lời mời chơi cờ là{" "}
              <strong className="text-indigo-700">
                {appointmentRequest_MaxHours_UntilExpiration ?? "Lỗi hiển thị"}
              </strong>{" "}
              giờ.
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontWeight: "600", color: "#1e40af", mt: 2, mb: 1 }}
            >
              3. Hủy Lịch Hẹn và Hoàn Tiền
            </Typography>
            <Typography
              paragraph
              sx={{ color: "#475569", lineHeight: "1.6", fontSize: "0.95rem" }}
            >
              - Khi hủy hẹn và thời gian hiện tại chưa đến{" "}
              <strong className="text-indigo-700">
                {refundHours ?? "Lỗi hiển thị"}
              </strong>{" "}
              tiếng trước giờ hẹn: lịch hẹn bị hủy sẽ được hoàn tiền 100%.
              <br />- Khi hủy hẹn và thời gian hiện tại nằm trong khoảng{" "}
              <strong className="text-indigo-700">
                {refundHours ?? "Lỗi hiển thị"} -{" "}
                {nonCancelableHours ?? "Lỗi hiển thị"}
              </strong>{" "}
              tiếng trước giờ hẹn: lịch hẹn bị hủy sẽ được hoàn tiền{" "}
              <strong className="text-indigo-700">
                {percentageRefundIfNotFull ?? "Lỗi hiển thị"}
              </strong>
              %, con số này có thể thay đổi tùy theo chính sách hệ thống.
              <br />- Nếu thời gian hiện tại chỉ còn dưới{" "}
              <strong className="text-indigo-700">
                {nonCancelableHours ?? "Lỗi hiển thị"}
              </strong>{" "}
              tiếng trước giờ hẹn: lịch đặt bàn không thể bị hủy.
              <br />- Quản trị viên chỉ có thể hủy các lịch hẹn của người dùng
              nếu thời gian hiện tại trên{" "}
              <strong className="text-indigo-700">
                {nonCancelableHours ?? "Lỗi hiển thị"}
              </strong>{" "}
              tiếng trước giờ hẹn. Tất cả các lịch đặt bị hủy bởi quản trị viên
              sẽ được hoàn tiền 100%.
              <br />- Mỗi tuần bạn chỉ được hủy bàn tối đa{" "}
              <strong className="text-indigo-700">
                {max_NumberOfTables_CancelPerWeek ?? "Lỗi hiển thị"}
              </strong>{" "}
              lần tính từ thứ 2 đến chủ nhật. Nếu bạn hủy nhiều hơn số bàn quy
              định, hệ thống sẽ không hoàn tiền cho bạn.
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontWeight: "600", color: "#1e40af", mt: 2, mb: 1 }}
            >
              4. Quản Lý Lời Mời
            </Typography>
            <Typography
              paragraph
              sx={{ color: "#475569", lineHeight: "1.6", fontSize: "0.95rem" }}
            >
              - Nếu đơn bàn có gửi lời mời đến người chơi khác, thời gian hiện
              tại còn trên{" "}
              <strong className="text-indigo-700">
                {nonCancelableHours ?? "Lỗi hiển thị"}
              </strong>{" "}
              tiếng trước giờ hẹn và những lời mời gửi đi trước đó đều đã hết
              hạn hoặc bị từ chối, người dùng có thể mời thêm người khác.
              <br />- Nếu đơn bàn có gửi lời mời đến người chơi khác, thời gian
              hiện tại chỉ còn dưới{" "}
              <strong className="text-indigo-700">
                {nonCancelableHours ?? "Lỗi hiển thị"}
              </strong>{" "}
              tiếng trước giờ hẹn, người dùng không thể gửi lời mời nữa. Nếu
              những lời mời gửi đi trước đó đều đã hết hạn hoặc bị từ chối, đơn
              bàn này sẽ tự động được hủy và người đặt bàn sẽ được hoàn tiền
              100%.
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontWeight: "600", color: "#1e40af", mt: 2, mb: 1 }}
            >
              5. Check-in và Check-out
            </Typography>
            <Typography
              paragraph
              sx={{ color: "#475569", lineHeight: "1.6", fontSize: "0.95rem" }}
            >
              - Thời gian bắt đầu check-in sẽ là{" "}
              <strong className="text-indigo-700">
                {minutesBeforeCheckIn ?? "Lỗi hiển thị"}
              </strong>{" "}
              phút trước giờ hẹn.
              <br />
              - Khi đến giờ chơi, chỉ có chủ lịch hẹn mới có quyền check-in.
              <br />- Người dùng phải check-out sau khi kết thúc buổi chơi.
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontWeight: "600", color: "#1e40af", mt: 2, mb: 1 }}
            >
              6. Cộng Đồng và Nội Dung
            </Typography>
            <Typography
              paragraph
              sx={{ color: "#475569", lineHeight: "1.6", fontSize: "0.95rem" }}
            >
              - Tab cộng đồng chỉ có thể truy cập khi người dùng đã nâng cấp tài
              khoản thành Thành viên.
              <br />
              - Bài viết tải lên cần được xác minh bởi Nhân viên hoặc Quản trị
              viên.
              <br />
              - Bài viết cập nhật cần được xác minh bởi Nhân viên hoặc Quản trị
              viên.
              <br />
              - Bình luận không được chứa từ ngữ tục tĩu.
              <br />- Chỉ được sử dụng số lượng thẻ (tag) giới hạn do hệ thống
              quy định khi tạo bài viết.
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontWeight: "600", color: "#1e40af", mt: 2, mb: 1 }}
            >
              7. Điểm Cá Nhân, Điểm Đóng Góp và Cơ Chế Đổi Thưởng
            </Typography>
            <Typography
              paragraph
              sx={{ color: "#475569", lineHeight: "1.6", fontSize: "0.95rem" }}
            >
              - Điểm cá nhân:
              <br />
                + Với mỗi bàn check-in thành công, người dùng sẽ nhận được điểm
              cá nhân tương đương{" "}
              <strong className="text-indigo-700">
                {userPoints_PerCheckinTable_ByPercentageOfTablesPrice ??
                  "Lỗi hiển thị"}
              </strong>
              % giá trị thanh toán.
              <br />
                + Điểm cá nhân khi tích lũy đủ có thể dùng để đổi các voucher
              giảm giá cho những lần đặt bàn kế tiếp. "Top Contributor" sẽ được
              hưởng ưu đãi giảm giá khi đổi voucher.
              <br />
              - Điểm đóng góp: Điểm đóng góp có thể được tích lũy bằng cách đăng
              bài và bình luận.
              <br />
                + Với mỗi bài viết được đăng tải: người dùng sẽ nhận được{" "}
              <strong className="text-indigo-700">
                {contributionPoints_PerThread ?? "Lỗi hiển thị"}
              </strong>{" "}
              điểm đóng góp.
              <br />
                + Với mỗi bình luận được đăng tải: người dùng sẽ nhận được{" "}
              <strong className="text-indigo-700">
                {contributionPoints_PerComment ?? "Lỗi hiển thị"}
              </strong>{" "}
              điểm đóng góp.
              <br />
                + Hằng tuần, hệ thống sẽ chọn ra{" "}
              <strong className="text-indigo-700">
                {numberof_TopContributors_PerWeek ?? "Lỗi hiển thị"}
              </strong>{" "}
              người dùng có điểm đóng góp cao nhất để công nhận là "Top
              Contributor", và được hưởng ưu đãi giảm giá khi mua voucher.
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontWeight: "600", color: "#1e40af", mt: 2, mb: 1 }}
            >
              8. Liên Hệ
            </Typography>
            <Typography
              paragraph
              sx={{ color: "#475569", lineHeight: "1.6", fontSize: "0.95rem" }}
            >
              Nếu bạn có câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi
              qua email:{" "}
              <a
                href="mailto:stratezone.app@gmail.com"
                className="text-indigo-600 hover:underline"
              >
                stratezone.app@gmail.com
              </a>{" "}
              hoặc số điện thoại:{" "}
              <span className="text-indigo-600">0123-456-789</span>.
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          padding: "16px 24px",
          backgroundColor: "#e0e7ff",
          borderTop: "1px solid #c7d2fe",
        }}
      >
        <MuiButton
          onClick={onClose}
          sx={{
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#4338ca",
            },
          }}
        >
          Đóng
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
}
