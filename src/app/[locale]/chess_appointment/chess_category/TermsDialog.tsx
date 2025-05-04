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
  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const response = await fetch(
          "https://backend-production-ac5e.up.railway.app/api/system/1",
          {
            method: "GET",
            headers: {
              Accept: "*/*",
            },
          }
        );
        const data = await response.json();
        setRefundHours(data.appointment_Refund100_HoursFromScheduleTime);
        setNonCancelableHours(data.appointment_Incoming_HoursFromScheduleTime);
        setMinutesBeforeCheckIn(
          data.appointment_Checkin_MinutesFromScheduleTime
        );
        setContributionPoints_PerThread(data.contributionPoints_PerThread);
        setContributionPoints_PerComment(data.contributionPoints_PerComment);
        setUserPoints_PerCheckinTable_ByPercentageOfTablesPrice(
          data.userPoints_PerCheckinTable_ByPercentageOfTablesPrice
        );
        setMax_NumberOfTables_CancelPerWeek(
          data.max_NumberOfTables_CancelPerWeek
        );
      } catch (error) {
        console.error("Error fetching system settings:", error);
        setRefundHours(3.5); // Fallback for refund hours
        setNonCancelableHours(1.5); // Fallback for non-cancelable hours
        setMinutesBeforeCheckIn(5); // Fallback for check-in minutes
      }
    };

    fetchSystemSettings();
  }, []);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Điều Khoản Sử Dụng</DialogTitle>
      <DialogContent>
        <Typography variant="h6">1. Quy Định Chung</Typography>
        <Typography paragraph>
          - Hệ thống chỉ hỗ trợ các loại cờ có 2 người chơi (ví dụ: Cờ Vua, Cờ
          Tướng, Cờ Vây).
          <br />
          - Người dùng chỉ có thể chọn giờ chơi trong khoảng thời gian mở cửa và
          đóng cửa của hệ thống, được quy định bởi giờ mở và giờ đóng hàng ngày.
          <br />- Lời mời tham gia chơi chỉ có thể được gửi trong các khung thời
          gian cụ thể do hệ thống thiết lập.
        </Typography>

        <Typography variant="h6">2. Đặt Bàn và Thanh Toán</Typography>
        <Typography paragraph>
          - Tất cả dịch vụ chỉ có thể được thanh toán thông qua ví điện tử của
          hệ thống.
          <br />
          - Một lịch hẹn có thể được sử dụng để đặt nhiều bàn ở các khung giờ
          khác nhau.
          <br />
          - Không hỗ trợ đặt cọc; tất cả lịch hẹn phải được thanh toán đầy đủ
          khi xác nhận.
          <br />
          - Lời mời chỉ có thể được gửi sau khi lịch đặt bàn đã được thanh toán.
          <br />
          - Nếu đặt bàn có lời mời, hóa đơn sẽ được chia đều cho người gửi lời
          mời và những người được mời đã xác nhận.
          <br />- Người dùng chấp nhận lời mời phải thanh toán phần còn lại của
          lịch đặt bàn đó.
        </Typography>

        <Typography variant="h6">3. Hủy Lịch Hẹn và Hoàn Tiền</Typography>
        <Typography paragraph>
          - Nếu thời gian hiện tại chưa đến{" "}
          <strong>{refundHours ?? "Lỗi hiển thị"}</strong> tiếng trước giờ hẹn,
          lịch hẹn bị hủy sẽ được hoàn tiền 100%.
          <br />
          - Nếu thời gian hiện tại nằm trong khoảng REF, lịch hẹn bị hủy sẽ được
          hoàn tiền dưới 100% theo chính sách hệ thống.
          <br />- Nếu thời gian hiện tại chỉ còn dưới{" "}
          <strong>{nonCancelableHours ?? "Lỗi hiển thị"}</strong> tiếng trước
          giờ hẹn, lịch đặt bàn không thể bị hủy.
          <br />
          - Quản trị viên chỉ có thể hủy các lịch đặt của người dùng nếu thời
          gian hiện tại chưa đến ICT.
          <br />- Tất cả các lịch đặt bị hủy bởi quản trị viên sẽ được hoàn tiền
          100%.
          <br />- Thời gian bắt đầu check-in sẽ là{" "}
          <strong>{minutesBeforeCheckIn ?? "Lỗi hiển thị"}</strong> phút trước
          giờ hẹn.
          <br />- Mỗi tuần bạn chỉ được hủy bàn tối đa{" "}
          <strong>
            {max_NumberOfTables_CancelPerWeek ?? "Lỗi hiển thị"}
          </strong>{" "}
          lần tính từ thứ 2 đến chủ nhật. Nếu bạn hủy nhiều hơn số bàn quy định,
          hệ thống sẽ không hoàn tiền cho bạn.
        </Typography>

        <Typography variant="h6">4. Quản Lý Lời Mời</Typography>
        <Typography paragraph>
          - Nếu thời gian hiện tại chưa đến ICT và chưa có ai chấp nhận lời mời,
          người dùng có thể mời người khác.
          <br />- Nếu thời gian hiện tại đã qua ICT, người dùng không thể gửi
          lời mời nữa.
        </Typography>

        <Typography variant="h6">5. Check-in và Check-out</Typography>
        <Typography paragraph>
          - Khi đến giờ chơi, chỉ có chủ lịch hẹn mới có quyền check-in.
          <br />- Người dùng phải check-out sau khi kết thúc buổi chơi.
        </Typography>

        <Typography variant="h6">6. Cộng Đồng và Nội Dung</Typography>
        <Typography paragraph>
          - Tab cộng đồng chỉ có thể truy cập khi người dùng đã nâng cấp tài
          khoản thành Thành viên.
          <br />
          - Bài viết tải lên cần được xác minh bởi Nhân viên hoặc Quản trị viên.
          <br />
          - Bài viết cập nhật cần được xác minh bởi Nhân viên hoặc Quản trị
          viên.
          <br />
          - Bình luận không được chứa từ ngữ tục tĩu.
          <br />
          - Chỉ được sử dụng số lượng thẻ (tag) giới hạn do hệ thống quy định
          khi tạo bài viết.
          <br />- Điểm đóng góp có thể được tích lũy bằng cách đăng bài và bình
          luận. Người dùng có điểm cao nhất trong tuần sẽ được gắn nhãn “TOP
          CONTRIBUTOR”.
        </Typography>
        <Typography variant="h6">
          7. Điểm Đóng Góp Và Cơ Chế Đổi Thưởng
        </Typography>
        <Typography paragraph>
          - Với mỗi bài viết được đăng tải người dùng sẽ nhận được{" "}
          <strong> {contributionPoints_PerThread ?? "Lỗi hiển thị"}</strong>{" "}
          điểm
          <br />- Với mỗi bình luận được đăng tải người dùng sẽ nhận được{" "}
          <strong>
            {contributionPoints_PerComment ?? "Lỗi hiển thị"}
          </strong>{" "}
          điểm
          <br />- Với mỗi bàn checkin thành công bạn sẽ nhận được{" "}
          <strong>
            {userPoints_PerCheckinTable_ByPercentageOfTablesPrice ??
              "Lỗi hiển thị"}
          </strong>{" "}
          % giá trị thanh toán
        </Typography>
        <Typography variant="h6">8. Liên Hệ</Typography>
        <Typography paragraph>
          Nếu bạn có câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi qua
          email: support@stratezone.com hoặc số điện thoại: 0123-456-789.
        </Typography>
      </DialogContent>
      <DialogActions>
        <MuiButton onClick={onClose} color="primary">
          Đóng
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
}
