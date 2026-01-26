// 1. 더미 데이터 (서버에서 받아왔다고 가정)
const mockPosts = [
    {
        id: 1,
        title: "제목 1",
        likes: 0,
        comments: 0,
        views: 0,
        date: "2021-01-01 00:00:00",
        author: "더미 작성자 1",
        authorImg: "" // 이미지가 없으면 회색 원
    },
    {
        id: 2,
        title: "제목 2 - 내용이 아주 긴 게시물의 경우 제목이 잘리는지 테스트",
        likes: 10,
        comments: 5,
        views: 120,
        date: "2024-01-22 16:30:00",
        author: "익명",
        authorImg: ""
    },
    {
        id: 3,
        title: "안녕하세요, 가입 인사 드립니다.",
        likes: 2,
        comments: 1,
        views: 45,
        date: "2024-01-22 15:00:00",
        author: "홍길동",
        authorImg: ""
    },
    {
        id: 4,
        title: "제목 4",
        likes: 0,
        comments: 0,
        views: 0,
        date: "2021-01-01 00:00:00",
        author: "더미 작성자 1",
        authorImg: ""
    }
];

// 2. HTML 요소 가져오기
const postList = document.getElementById('postList');

// 3. 게시글 카드를 만드는 함수
function createPostElement(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    // 클릭하면 상세 페이지로 이동 (나중에 구현)
    card.onclick = () => {
        location.href = "post_detail.html";
    };

    let displayTitle = post.title;
    if (displayTitle.length > 26) {
        displayTitle = displayTitle.substring(0, 26);
    }

    card.innerHTML = `
        <h3 class="card-title">${displayTitle}</h3>
        <div class="card-info">
            <div class="stats">
                <span>좋아요 ${post.likes}</span>
                <span>댓글 ${post.comments}</span>
                <span>조회수 ${post.views}</span>
            </div>
            <div class="date">${post.date}</div>
        </div>
        <div class="card-author">
            <div class="author-img"></div> <span class="author-name">${post.author}</span>
        </div>
    `;

    return card;
}

// 4. 화면에 그리기
function renderPosts() {
    // 기존 내용 비우기
    postList.innerHTML = "";

    // 데이터 반복해서 추가
    mockPosts.forEach(post => {
        const postEl = createPostElement(post);
        postList.appendChild(postEl);
    });
}

// 5. 실행
renderPosts();

// 6. 드롭다운 메뉴 기능
const profileIcon = document.getElementById('profileIcon');
const userDropdown = document.getElementById('userDropdown');

// 프로필 아이콘 클릭 시 메뉴 토글
profileIcon.addEventListener('click', function(event) {
    // 이벤트 버블링 방지 (부모에게 클릭 전달 안 함)
    event.stopPropagation(); 
    userDropdown.classList.toggle('show');
});

// 화면의 다른 곳을 클릭하면 메뉴 닫기
document.addEventListener('click', function(event) {
    // 클릭한 곳이 프로필 아이콘 내부가 아니라면 닫기
    if (!profileIcon.contains(event.target)) {
        userDropdown.classList.remove('show');
    }
});

// 1. 저장된 정보 가져오기
const storedUser = localStorage.getItem('user');

if (storedUser) {
    const currentUser = JSON.parse(storedUser);
    
    // 2. 헤더의 동그라미 아이콘 찾기
    const headerProfileIcon = document.querySelector('.user-avatar');
    
    // 3. 이미지가 있고, 요소가 찾았으면 배경으로 설정
    if (headerProfileIcon && currentUser.profileImage) {
        headerProfileIcon.style.backgroundImage = `url('${currentUser.profileImage}')`;
        headerProfileIcon.style.backgroundSize = 'cover';      // 꽉 차게
        headerProfileIcon.style.backgroundPosition = 'center'; // 중앙 정렬
    }
}