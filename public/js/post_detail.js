// 1. 더미 데이터
const mockPost = {
    id: 1,
    title: "제목 1",
    author: "더미 작성자 1",
    date: "2021-01-01 00:00:00",
    content: "삶은 항상 놀라운 모험이라고 생각합니다...",
    likes: 999,      // 테스트용: 클릭하면 1k 됨
    views: 1200,     // 1k 테스트
    comments: 0,
    image: null
};

let mockComments = [
    { id: 101, author: "더미 작성자 1", date: "2021-01-01 00:00:00", content: "댓글 내용 1" },
    { id: 102, author: "익명", date: "2021-01-02 00:00:00", content: "댓글 내용 2" },
];

// 2. 요소 가져오기
const backBtn = document.getElementById('backBtn');
// 게시글 요소
const postTitle = document.getElementById('postTitle');
const postAuthor = document.getElementById('postAuthor');
const postDate = document.getElementById('postDate');
const postBody = document.getElementById('postBody');
const likeCount = document.getElementById('likeCount');
const viewCount = document.getElementById('viewCount');
const commentCount = document.getElementById('commentCount');
const likeBox = document.getElementById('likeBox'); // HTML에 id="likeBox" 추가 필요 (아래 설명 참조)
const postDeleteBtn = document.getElementById('postDeleteBtn');
// 댓글 요소
const commentList = document.getElementById('commentList');
const commentInput = document.getElementById('commentInput');
const commentSubmitBtn = document.getElementById('commentSubmitBtn');
// 모달 요소
const postDeleteModal = document.getElementById('postDeleteModal');
const commentDeleteModal = document.getElementById('commentDeleteModal');

// 상태 변수
let isLiked = false; // 좋아요 눌렀는지 여부
let editingCommentId = null; // 현재 수정 중인 댓글 ID (null이면 새 댓글 작성 모드)
let targetCommentIdToDelete = null; // 삭제할 댓글 ID

// ============================================================
// ★ 1. 숫자 포맷팅 함수 (1k, 10k, 100k)
// ============================================================
function formatNumber(num) {
    if (num >= 1000) {
        return Math.floor(num / 1000) + 'k'; // 1000 이상이면 k 붙임
    }
    return num; // 1000
}


// 3. 초기화 및 렌더링
function initPost() {
    postTitle.textContent = mockPost.title;
    postAuthor.textContent = mockPost.author;
    postDate.textContent = mockPost.date;
    postBody.textContent = mockPost.content;
    
    // 포맷팅 적용하여 표시
    renderStats();

    renderComments();
    checkCommentBtn(); // 버튼 초기 상태 설정
}

function renderStats() {
    likeCount.textContent = formatNumber(mockPost.likes);
    viewCount.textContent = formatNumber(mockPost.views);
    commentCount.textContent = formatNumber(mockComments.length); // 실제 댓글 배열 길이로
}

function renderComments() {
    commentList.innerHTML = "";
    mockComments.forEach(cmt => {
        const item = document.createElement('div');
        item.className = 'comment-item';
        item.innerHTML = `
            <div class="comment-header">
                <div class="author-info">
                    <div class="author-avatar" style="width:28px; height:28px;"></div>
                    <strong>${cmt.author}</strong>
                    <span class="date">${cmt.date}</span>
                </div>
                <div class="comment-actions">
                    <button class="action-btn" onclick="prepareEditComment(${cmt.id})">수정</button>
                    <button class="action-btn" onclick="openCommentModal(${cmt.id})">삭제</button>
                </div>
            </div>
            <div class="comment-content">${cmt.content}</div>
        `;
        commentList.appendChild(item);
    });
    // 댓글 수 업데이트
    renderStats();
}

// ============================================================
// ★ 2. 좋아요 토글 기능
// ============================================================
// HTML 수정 필요: 좋아요 박스 div에 class="stat-item like-btn" id="likeBox" 추가
// (아래 3번 HTML 수정 파트에서 적용)

// 좋아요 박스 클릭 이벤트는 initPost 밖이나 addEventListener로 처리
// 여기서는 요소가 있다고 가정하고 리스너 추가 (요소가 없으면 에러나므로 HTML id 확인 필수)
if(document.querySelector('.stats-box')) { 
    // 좋아요 버튼 요소 찾기 (DOM이 그려진 후)
    const likeBtnDiv = document.querySelector('.stats-box .stat-item:first-child');
    
    likeBtnDiv.classList.add('like-btn'); // CSS용 클래스 추가
    
    likeBtnDiv.addEventListener('click', function() {
        if (isLiked) {
            // 이미 좋아요 상태면 -> 취소 (-1, 회색)
            mockPost.likes--;
            this.classList.remove('active');
            isLiked = false;
        } else {
            // 안 누른 상태면 -> 좋아요 (+1, 보라색)
            mockPost.likes++;
            this.classList.add('active');
            isLiked = true;
        }
        renderStats(); // 숫자 다시 그리기
    });
}


// ============================================================
// ★ 3. 댓글 입력 감지 (버튼 활성화/비활성화)
// ============================================================
commentInput.addEventListener('input', checkCommentBtn);

function checkCommentBtn() {
    const text = commentInput.value.trim();
    if (text.length > 0) {
        // 활성화 색상 (#7F6AEE)
        commentSubmitBtn.classList.add('active'); 
        commentSubmitBtn.disabled = false;
    } else {
        // 비활성화 색상 (#ACA0EB)
        commentSubmitBtn.classList.remove('active');
        commentSubmitBtn.disabled = true;
    }
}


// ============================================================
// ★ 4. 댓글 등록 및 수정 기능
// ============================================================
commentSubmitBtn.addEventListener('click', () => {
    const text = commentInput.value.trim();
    if(text === "") return;

    if (editingCommentId) {
        // [수정 모드] 기존 댓글 업데이트
        const target = mockComments.find(c => c.id === editingCommentId);
        if (target) {
            target.content = text; // 내용 변경
            // (선택사항: 날짜도 수정일로 변경 가능)
        }
        
        // 모드 초기화
        editingCommentId = null;
        commentSubmitBtn.textContent = "댓글 등록";
    } else {
        // [등록 모드] 새 댓글 추가
        mockComments.push({
            id: Date.now(),
            author: "나", 
            date: "2024-01-25 12:00:00", // 실제론 new Date() 포맷팅
            content: text
        });
        alert("댓글이 등록되었습니다.");
    }

    commentInput.value = ""; // 입력창 비우기
    checkCommentBtn();       // 버튼 비활성화
    renderComments();        // 목록 갱신
});

// [수정 버튼 클릭 시] 입력창에 내용 채우고 버튼 바꾸기
window.prepareEditComment = function(id) {
    const target = mockComments.find(c => c.id === id);
    if (!target) return;

    commentInput.value = target.content; // 내용 채우기
    commentInput.focus();                // 포커스 이동
    checkCommentBtn();                   // 버튼 활성화
    
    // 상태 변경
    editingCommentId = id;
    commentSubmitBtn.textContent = "댓글 수정"; // 버튼 글자 변경
};


// ============================================================
// ★ 5. 모달 스크롤 잠금 (body overflow 제어)
// ============================================================
function toggleBodyScroll(lock) {
    if (lock) {
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
    }
}

// 게시글 수정 버튼

document.getElementById('postEditBtn').addEventListener('click', () => {
    location.href = 'edit_post.html'; 
});

// 게시글 삭제 모달
postDeleteBtn.addEventListener('click', () => {
    postDeleteModal.style.display = 'flex';
    toggleBodyScroll(true); // 스크롤 잠금
});
document.getElementById('postDelCancel').addEventListener('click', () => {
    postDeleteModal.style.display = 'none';
    toggleBodyScroll(false); // 잠금 해제
});
document.getElementById('postDelConfirm').addEventListener('click', () => {
    alert("게시글 삭제됨");
    location.href = 'board.html';
    // 페이지 이동하므로 잠금 해제 불필요
});

// 댓글 삭제 모달
window.openCommentModal = function(id) {
    targetCommentIdToDelete = id;
    commentDeleteModal.style.display = 'flex';
    toggleBodyScroll(true); // 스크롤 잠금
};
document.getElementById('cmtDelCancel').addEventListener('click', () => {
    commentDeleteModal.style.display = 'none';
    toggleBodyScroll(false); // 잠금 해제
});
document.getElementById('cmtDelConfirm').addEventListener('click', () => {
    mockComments = mockComments.filter(c => c.id !== targetCommentIdToDelete);
    renderComments();
    commentDeleteModal.style.display = 'none';
    toggleBodyScroll(false); // 잠금 해제
    
    // 만약 수정 중이던 댓글을 삭제했다면 초기화
    if (editingCommentId === targetCommentIdToDelete) {
        editingCommentId = null;
        commentInput.value = "";
        commentSubmitBtn.textContent = "댓글 등록";
        checkCommentBtn();
    }
});


// 뒤로가기 등 기타 기능
backBtn.addEventListener('click', () => location.href = 'board.html');

// 공통 헤더 로직 실행
initPost();

// (헤더 프로필 로직 - 기존과 동일하게 유지)
const profileIcon = document.getElementById('profileIcon');
const userDropdown = document.getElementById('userDropdown');
const storedUser = localStorage.getItem('user');
if (storedUser) {
    const currentUser = JSON.parse(storedUser);
    const headerProfileIcon = document.querySelector('.user-avatar');
    if (headerProfileIcon && currentUser.profileImage) {
        headerProfileIcon.style.backgroundImage = `url('${currentUser.profileImage}')`;
        headerProfileIcon.style.backgroundSize = 'cover';
        headerProfileIcon.style.backgroundPosition = 'center';
    }
}
profileIcon.addEventListener('click', (e) => { e.stopPropagation(); userDropdown.classList.toggle('show'); });
document.addEventListener('click', (e) => { if (!profileIcon.contains(e.target)) userDropdown.classList.remove('show'); });