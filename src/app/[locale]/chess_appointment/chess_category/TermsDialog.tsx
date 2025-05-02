import React from "react";
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
          - Nếu thời gian hiện tại chưa đến thời điểm REF100, lịch hẹn bị hủy sẽ
          được hoàn tiền 100%.
          <br />
          - Nếu thời gian hiện tại nằm trong khoảng REF, lịch hẹn bị hủy sẽ được
          hoàn tiền dưới 100% theo chính sách hệ thống.
          <br />
          - Nếu thời gian hiện tại đã vượt qua ICT, lịch đặt bàn không thể bị
          hủy.
          <br />
          - Quản trị viên chỉ có thể hủy các lịch đặt của người dùng nếu thời
          gian hiện tại chưa đến ICT.
          <br />- Tất cả các lịch đặt bị hủy bởi quản trị viên sẽ được hoàn tiền
          100%.
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
          luận. Người dùng có điểm cao nhất trong tuần sẽ được gắn nhãn “Người
          đóng góp hàng đầu”.
        </Typography>

        <Typography variant="h6">7. Liên Hệ</Typography>
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
