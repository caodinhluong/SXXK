from .route import Route

# Câu hỏi liên quan đến hệ thống SXXK (xuất nhập khẩu)
MAIN_QUERY_SAMPLES = [
    # Đăng nhập & tài khoản
    "Cách đăng nhập vào hệ thống?",
    "Làm sao để đăng ký tài khoản doanh nghiệp?",
    "Quên mật khẩu phải làm gì?",
    "Tài khoản bị khóa thì xử lý thế nào?",
    "Mã số thuế dùng để đăng nhập như thế nào?",
    # Tờ khai
    "Cách tra cứu tờ khai nhập khẩu?",
    "Hướng dẫn tra cứu tờ khai xuất khẩu?",
    "Làm thế nào để tìm kiếm tờ khai theo số?",
    "Import tờ khai từ file Excel như thế nào?",
    "Xem chi tiết tờ khai nhập ở đâu?",
    "Tờ khai xuất có những thông tin gì?",
    "Quản lý tờ khai nhập xuất khẩu ở menu nào?",
    "Tờ khai là gì trong hệ thống?",
    # Hàng hóa & kho
    "Xem tồn kho nguyên phụ liệu ở đâu?",
    "Làm sao để kiểm tra tồn kho hiện tại?",
    "Tồn kho sản phẩm được hiển thị thế nào?",
    "Nhập hàng vào kho như thế nào?",
    "Xuất hàng ra khỏi kho thực hiện ở đâu?",
    "Báo cáo tồn kho theo kỳ ở đâu?",
    "Kho trong hệ thống SXXK là gì?",
    "Phiếu nhập kho được tạo như thế nào?",
    "Phiếu xuất kho gồm những thông tin gì?",
    # Định mức
    "Định mức sản phẩm là gì?",
    "Cách tạo định mức trong hệ thống?",
    "Import định mức từ Excel vào hệ thống như thế nào?",
    "Chỉnh sửa định mức đã tạo ở đâu?",
    "Xóa định mức không dùng nữa thế nào?",
    "Định mức được dùng để làm gì?",
    # Hợp đồng
    "Tạo hợp đồng sản xuất xuất khẩu như thế nào?",
    "Hợp đồng trong hệ thống SXXK gồm những gì?",
    "Xem danh sách hợp đồng ở đâu?",
    "Hợp đồng liên kết với tờ khai như thế nào?",
    # Đối soát
    "Đối soát nhập là gì?",
    "Cách thực hiện đối soát nhập hàng?",
    "Đối soát xuất hàng thực hiện như thế nào?",
    "Đối soát định mức để làm gì?",
    "Kiểm tra phiếu nhập kho với tờ khai nhập ở đâu?",
    "Đối soát xuất kho với tờ khai xuất thế nào?",
    # Báo cáo thanh khoản
    "Báo cáo thanh khoản là gì?",
    "Tạo báo cáo thanh khoản như thế nào?",
    "Báo cáo thanh khoản hợp đồng xuất khẩu gồm những gì?",
    "Xuất báo cáo ra file Excel?",
    "Báo cáo thanh khoản dùng để nộp cho hải quan không?",
    # Sản phẩm & nguyên phụ liệu
    "Thêm sản phẩm mới vào danh mục như thế nào?",
    "Nguyên phụ liệu được quản lý ở đâu?",
    "Import danh sách sản phẩm từ Excel?",
    "Mã sản phẩm được tạo thế nào?",
    # Vận đơn
    "Vận đơn trong hệ thống là gì?",
    "Tạo vận đơn xuất hàng thế nào?",
    "Vận đơn liên kết với tờ khai như thế nào?",
    # Phiếu sản xuất
    "Phiếu sản xuất là gì trong SXXK?",
    "Tạo phiếu sản xuất như thế nào?",
    "Phiếu sản xuất ảnh hưởng đến tồn kho thế nào?",
    # Quy đổi đơn vị
    "Quy đổi đơn vị tính hải quan là gì?",
    "Cách thêm tỷ lệ quy đổi đơn vị?",
    # Tổng quan
    "Dashboard tổng quan hiển thị thông tin gì?",
    "Các chức năng chính của hệ thống SXXK là gì?",
    "Hệ thống SXXK hỗ trợ những nghiệp vụ nào?",
    "Sơ đồ quy trình sử dụng hệ thống như thế nào?",
    "Hệ thống quản lý xuất nhập khẩu dùng để làm gì?",
    "Hướng dẫn sử dụng hệ thống SXXK",
    "Cách sử dụng hệ thống",
    "Hỗ trợ sử dụng phần mềm",
    "Tra cứu thông tin",
    "Xem hướng dẫn",
    "Tôi cần hỗ trợ về hệ thống",
    "Làm sao để dùng chức năng này?",
    "Chức năng này ở đâu trong hệ thống?",
]

CHITCHAT_SAMPLES = [
    "Xin chào",
    "Chào bạn",
    "Hello",
    "Hi",
    "Cảm ơn",
    "Cảm ơn bạn",
    "Cảm ơn nhiều",
    "Thanks",
    "Cảm ơn đã hỗ trợ",
    "Rất cảm ơn",
    "Ok rồi",
    "Oke",
    "Được rồi",
    "Tôi hiểu rồi",
    "Hiểu rồi",
    "Tạm biệt",
    "Bye",
    "Hẹn gặp lại",
    "Thôi tôi đi nhé",
    "Tốt lắm",
    "Hay quá",
    "Tuyệt vời",
    "Bạn là ai?",
    "Bạn là chatbot à?",
    "Bạn làm được gì?",
    "Bạn có thể giúp gì cho tôi?",
    "Trợ lý ảo SXXK là gì?",
    "Hệ thống đang chạy tốt không?",
    "Có ai online không?",
    "Tôi cần giúp đỡ",
    "Giúp tôi với",
    "Hôm nay thế nào?",
    "Thời tiết hôm nay ra sao?",
    "Bạn có biết không?",
    "Cho tôi hỏi chút",
]

MAIN_QUERY_ROUTE = Route(name="main_query", samples=MAIN_QUERY_SAMPLES)
CHITCHAT_ROUTE = Route(name="chitchat", samples=CHITCHAT_SAMPLES)
ROUTES = [MAIN_QUERY_ROUTE, CHITCHAT_ROUTE]

__all__ = ["ROUTES", "MAIN_QUERY_ROUTE", "CHITCHAT_ROUTE"]
