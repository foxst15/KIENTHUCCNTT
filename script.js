// Dữ liệu mẫu về kiến thức IT (Nơi bạn thêm nội dung thực tế)
const knowledgeData = [
    { id: 1, title: "HTML Cơ bản & Thẻ Semantic", tags: ["web", "frontend", "markup"], summary: "Cấu trúc trang web và cách sử dụng các thẻ có ý nghĩa (header, nav, section, footer).", link: "https://www.w3schools.com/html/" },
    { id: 2, title: "Biến trong JavaScript: var, let, const", tags: ["javascript", "programming", "frontend"], summary: "Phân biệt phạm vi (scope) và cách sử dụng các loại khai báo biến khác nhau trong JS.", link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var" },
    { id: 3, title: "Thuật toán Sắp xếp (Sorting Algorithms)", tags: ["data structure", "algorithm", "cs"], summary: "Tìm hiểu về Bubble Sort, Merge Sort, Quick Sort và độ phức tạp thời gian (Time Complexity).", link: "https://www.geeksforgeeks.org/sorting-algorithms/" },
    { id: 4, title: "Giới thiệu về ReactJS Component", tags: ["web", "frontend", "framework"], summary: "Tạo và quản lý các component Function và Class, khái niệm về State và Props.", link: "https://react.dev/learn/your-first-component" },
    { id: 5, title: "Câu lệnh SQL cơ bản (CRUD)", tags: ["database", "backend", "sql"], summary: "Các lệnh SELECT, INSERT, UPDATE, DELETE để thao tác dữ liệu trong CSDL.", link: "https://www.w3schools.com/sql/" },
    { id: 6, title: "Lập trình Hướng đối tượng (OOP)", tags: ["programming", "cs", "oop"], summary: "Bốn trụ cột: Kế thừa (Inheritance), Đa hình (Polymorphism), Trừu tượng (Abstraction), Đóng gói (Encapsulation).", link: "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/" },
    { id: 7, title: "Con trỏ (Pointers) trong C++", tags: ["c++", "programming", "memory"], summary: "Cách khai báo, sử dụng con trỏ và thao tác trực tiếp với địa chỉ bộ nhớ.", link: "https://www.geeksforgeeks.org/pointers-in-c-cpp/" },
    { id: 8, title: "Quản lý Bộ nhớ (Memory Management) C++", tags: ["c++", "programming", "cs"], summary: "Phân biệt cấp phát bộ nhớ tĩnh, ngăn xếp (stack) và cấp phát động bằng `new` và `delete`.", link: "https://www.geeksforgeeks.org/dynamic-memory-allocation-in-c/" },
    { id: 9, title: "Template trong C++", tags: ["c++", "programming", "oop"], summary: "Viết hàm hoặc lớp tổng quát (generic) để làm việc với các kiểu dữ liệu khác nhau.", link: "https://www.w3schools.com/cpp/cpp_templates.asp" },
    { id: 10, title: "LINQ (Language Integrated Query) trong C#", tags: ["c#", "dot.net", "data", "programming"], summary: "Cú pháp truy vấn dữ liệu đồng nhất từ các nguồn khác nhau (mảng, CSDL, XML).", link: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/" },
    { id: 11, title: "Kiểu Dữ liệu Nullable và Non-nullable C#", tags: ["c#", "programming"], summary: "Tìm hiểu cách xử lý giá trị `null` an toàn với các kiểu giá trị.", link: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types" },
    { id: 12, title: "Async/Await trong C#", tags: ["c#", "programming", "backend"], summary: "Lập trình không đồng bộ (asynchronous programming) để cải thiện hiệu năng ứng dụng.", link: "https://learn.microsoft.com/en-us/dotnet/csharp/async-and-await" }
];

const knowledgeListElement = document.getElementById('knowledge-list');
const searchInput = document.getElementById('searchInput');

/**
 * Hiển thị danh sách kiến thức lên trang web.
 * @param {Array<Object>} data - Mảng các đối tượng kiến thức.
 */
function displayKnowledge(data) {
    // Xóa nội dung cũ
    knowledgeListElement.innerHTML = "<h2>Kết quả Tìm kiếm</h2>";
    
    if (data.length === 0) {
        knowledgeListElement.innerHTML += "<p>Không tìm thấy kết quả nào phù hợp. Vui lòng thử từ khóa khác.</p>";
        return;
    }

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('knowledge-item');
        itemDiv.innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
            <p><strong>Tags:</strong> ${item.tags.join(', ')}</p>
            <a href="${item.link}" target="_blank">Xem chi tiết &rarr;</a>
        `;
        knowledgeListElement.appendChild(itemDiv);
    });
}

/**
 * Xử lý chức năng tìm kiếm.
 */
function searchKnowledge() {
    const query = searchInput.value.toLowerCase().trim();
    
    // Lọc dữ liệu dựa trên tiêu đề, tóm tắt hoặc tags
    const filteredData = knowledgeData.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const summaryMatch = item.summary.toLowerCase().includes(query);
        // Kiểm tra xem có tag nào khớp với truy vấn không
        const tagsMatch = item.tags.some(tag => tag.includes(query));
        
        return titleMatch || summaryMatch || tagsMatch;
    });

    displayKnowledge(filteredData);
}

// Thêm sự kiện lắng nghe để tìm kiếm khi nhấn Enter
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchKnowledge();
    }
});

// Hiển thị danh sách đầy đủ khi trang được tải lần đầu
document.addEventListener('DOMContentLoaded', () => {
    displayKnowledge(knowledgeData);
});