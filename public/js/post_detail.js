// public/js/post_detail.js

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

const postTitle = document.getElementById('postTitle');
const postAuthor = document.getElementById('postAuthor');
const postDate = document.getElementById('postDate');
const postBody = document.getElementById('postBody');
const likeCount = document.getElementById('likeCount');
const viewCount = document.getElementById('viewCount');
const commentCount = document.getElementById('commentCount');
const commentList = document.getElementById('commentList');
const commentInput = document.getElementById('commentInput');
const commentSubmitBtn = document.getElementById('commentSubmitBtn');
const postDeleteModal = document.getElementById('postDeleteModal');
const commentDeleteModal = document.getElementById('commentDeleteModal');
const backBtn = document.getElementById('backBtn');

// 상태 변수
let isLiked = false; // 좋아요 눌렀는지 여부
let editingCommentId = null; // 현재 수정 중인 댓글 ID (null이면 새 댓글 작성 모드)
let targetCommentIdToDelete = null; // 삭제할 댓글 ID

// 숫자 포맷팅
function formatNumber(num) {
    if (num >= 1000) {
        return Math.floor(num / 1000) + 'k'; // 1000 이상이면 k 붙임
    }
    return num; // 1000
}

// 스크롤 잠금
function toggleBodyScroll(lock) {
    document.body.classList.toggle('no-scroll', lock);
}


// 페이지 로드
async function initPage(){
    if (!postId){
        alert("존재하지 않는 게시글입니다.");
        location.href = "board.html";
        return;
    }
    
    // 본문 데이터 먼저 로딩
    await loadPostContent();

    // 댓글 데이터 로딩
    loadComments();
}

async function loadPostContent() {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/posts/${postId}`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok) {
            const post = result.data;

            isLiked = post.isLiked || false; 

            // 초기 로드 시 버튼 색상 적용 (D9D9D9 ↔ ACA0EB)
            const likeBtnDiv = document.querySelector('.stat-item');
            if (likeBtnDiv) {
                likeBtnDiv.classList.toggle('active', isLiked);
            }
            
            postTitle.textContent = post.title;
            postAuthor.textContent = post.author.nickname; // AuthorDetail 객체 접근
            postDate.textContent = post.createdAt;
            postBody.textContent = post.content;
            likeCount.textContent = formatNumber(post.likeCount);
            viewCount.textContent = formatNumber(post.viewCount);
        }
    } catch (error) {
        console.error("본문 로드 실패:", error);
    }
}

// 1. 요소 정의 (파일 상단 변수 선언부에 추가)
const likeBtnDiv = document.querySelector('.stat-item');

// 2. 좋아요 클릭 이벤트 리스너 (initPage 함수 실행 전/후 어디든 상관없으나 주석 해제 필수)
if (likeBtnDiv) {
    likeBtnDiv.addEventListener('click', async function() {
        try {
            // 현재 상태(isLiked)에 따라 요청 방식 결정
            const response = await fetch(`http://127.0.0.1:8000/api/v1/posts/${postId}/likes`, {
                method: isLiked ? 'DELETE' : 'POST',
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok) {
                // 서버 응답으로 상태 동기화
                isLiked = result.data.isLiked; 
                
                // [색상 변경] active 클래스 토글 (CSS의 !important와 연동)
                this.classList.toggle('active', isLiked); 
                
                // [숫자 변경] k 단위 포맷팅 적용
                likeCount.textContent = formatNumber(result.data.likeCount);
            } else if (response.status === 409) {
                // 상태 불일치(Conflict) 에러 시 새로고침
                alert("상태가 동기화되지 않았습니다. 페이지를 다시 불러옵니다.");
                location.reload();
            } else {
                alert(result.message || "좋아요 처리 중 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("좋아요 통신 오류:", error);
        }
    });
}

// likeBtnDiv.addEventListener('click', async function() {
//     try {
//         const response = await fetch(`http://127.0.0.1:8000/api/v1/posts/${postId}/likes`, {
//             method: isLiked ? 'DELETE' : 'POST',
//             credentials: 'include'
//         });

//         const result = await response.json();

//         if (response.ok) {
//             // [복구] 서버가 알려주는 최신 isLiked 상태를 직접 대입
//             isLiked = result.data.isLiked; 
            
//             // [복구] 클래스 토글을 통해 색상 즉시 변경 (ACA0EB ↔ D9D9D9)
//             this.classList.toggle('active', isLiked); 
            
//             // [복구] k 단위 포맷팅 적용하여 숫자 업데이트
//             likeCount.textContent = formatNumber(result.data.likeCount);
//         } else if (response.status === 409) {
//             // 상태 불일치 시 메시지 띄우고 강제 새로고침
//             alert("상태가 동기화되지 않았습니다. 페이지를 다시 불러옵니다.");
//             location.reload();
//         }
//     } catch (error) {
//         console.error("좋아요 처리 오류:", error);
//     }
// });

// 댓글 목록 로드
async function loadComments() {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/comments/posts/${postId}`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok) {
            renderComments(result.data || []);
            // [수정 이유] 댓글 목록의 길이를 측정하여 댓글 수 갱신
            commentCount.textContent = formatNumber(result.data.length);
        }
    } catch (error) {
        console.error("댓글 로딩 실패:", error);
    }
}

commentSubmitBtn.addEventListener('click', async () => {
    const text = commentInput.value.trim();
    if(!text) return;

    // [보완] 더미 배열 수정이 아닌 서버 API 호출 (POST/PUT)
    const url = editingCommentId 
        ? `http://127.0.0.1:8000/api/v1/comments/${editingCommentId}` 
        : `http://127.0.0.1:8000/api/v1/comments/posts/${postId}`;
    const method = editingCommentId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ content: text })
        });

        if (response.ok) {
            editingCommentId = null;
            commentSubmitBtn.textContent = "댓글 등록";
            commentInput.value = "";
            checkCommentBtn();
            loadComments(); // [보완] 성공 후 서버 데이터 다시 로드
        }
    } catch (error) { console.error(error); }
});

function renderComments(comments) {
    commentList.innerHTML = "";
    comments.forEach(cmt => {
        const item = document.createElement('div');
        item.className = 'comment-item';
        // [보완] 서버 응답 필드(commentId, author.nickname)에 맞춰 수정
        item.innerHTML = `
            <div class="comment-header">
                <div class="author-info">
                    <strong>${cmt.author.nickname}</strong>
                    <span class="date">${cmt.createdAt}</span>
                </div>
                <div class="comment-actions">
                    <button class="action-btn" onclick="prepareEditComment(${cmt.commentId}, '${cmt.content}')">수정</button>
                    <button class="action-btn" onclick="openCommentModal(${cmt.commentId})">삭제</button>
                </div>
            </div>
            <div class="comment-content">${cmt.content}</div>
        `;
        commentList.appendChild(item);
    });
}



// 댓글 입력 버튼 활성화
commentInput.addEventListener('input', () => {
    const text = commentInput.value.trim();
    
    // 1. 실시간 입력 값 확인 (공백 제외)
    if (text.length > 0) {
        // 2. 조건 충족 시 보라색(#7F6AEE) 활성화 및 클릭 허용
        commentSubmitBtn.classList.add('active'); 
        commentSubmitBtn.disabled = false;
    } else {
        // 3. 미충족 시 연보라색(#ACA0EB) 비활성화 및 클릭 차단
        commentSubmitBtn.classList.remove('active');
        commentSubmitBtn.disabled = true;
    }
});

// 좋아요 기능
// const likeBtnDiv = document.querySelector('.stat-item');
// if(likeBtnDiv) {
//     likeBtnDiv.addEventListener('click', async function() {
//         // LikeController 엔드포인트 연동
//         const response = await fetch(`http://127.0.0.1:8000/api/v1/posts/${postId}/likes`, {
//             method: isLiked ? 'DELETE' : 'POST',
//             credentials: 'include'
//         });
//         const result = await response.json();
//         if (response.ok) {
//             isLiked = !isLiked;
//             this.classList.toggle('active', isLiked);
//             likeCount.textContent = formatNumber(result.data.likeCount);
//         }
//     });
// }

// [수정된 post_detail.js 의 좋아요 부분]


// if (likeBtnDiv) {
//     // 1. 반드시 클릭 이벤트 리스너로 감싸야 합니다.
//     // 2. 내부에서 await를 쓰기 위해 async를 붙여줍니다.
//     likeBtnDiv.addEventListener('click', async function() {
//         try {
//             // [변경사항 반영] 서버에 좋아요 상태 변경 요청
//             const response = await fetch(`http://127.0.0.1:8000/api/v1/posts/${postId}/likes`, {
//                 method: isLiked ? 'DELETE' : 'POST', // 현재 상태에 따라 전송 방식 결정
//                 credentials: 'include'
//             });

//             const result = await response.json();

//             if (response.ok) {
//                 // [복구] 서버가 주는 실제 데이터(isLiked: true/false)를 전역 변수에 반영
//                 isLiked = result.data.isLiked; 
                
//                 // [복구] 버튼 색상 토글 (이미지 요구사항: ACA0EB ↔ D9D9D9)
//                 // 여기서 'this'는 클릭된 'likeBtnDiv'를 가리킵니다.
//                 this.classList.toggle('active', isLiked); 
                
//                 // [복구] k 단위 포맷팅 적용하여 숫자 업데이트 (1000 -> 1k)
//                 likeCount.textContent = formatNumber(result.data.likeCount);
//             } else if (response.status === 409) {
//                 // 상태 불일치 시 자동 새로고침 유도
//                 alert("상태가 동기화되지 않았습니다. 페이지를 다시 불러옵니다.");
//                 location.reload();
//             } else {
//                 alert(result.message || "좋아요 처리 중 오류가 발생했습니다.");
//             }
//         } catch (error) {
//             console.error("좋아요 통신 오류:", error);
//         }
//     });
// }

window.prepareEditComment = (id, content) => {
    editingCommentId = id;
    commentInput.value = content;
    commentInput.focus();
    commentSubmitBtn.textContent = "댓글 수정";
    checkCommentBtn();
};

// 댓글 입력 감지
commentInput.addEventListener('input', checkCommentBtn);

function checkCommentBtn() {
    const text = commentInput.value.trim();
    commentSubmitBtn.disabled = text.length === 0;
    commentSubmitBtn.classList.toggle('active', text.length > 0);
}


// 게시글 수정 버튼
document.getElementById('postEditBtn').addEventListener('click', async() => {
    try {
        // 백엔드 PUT/DELETE API는 이미 내부에서 권한 체크(403)를 수행함
        // 수정 페이지로 가기 전 간단한 GET 요청으로 확인 가능
        const response = await fetch(`http://127.0.0.1:8000/api/v1/posts/${postId}`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (response.ok) {
            // [핵심] 사용자의 닉네임과 게시글 작성자 닉네임이 일치하는지 확인
            // 세션 정보나 result.data에 포함된 작성자 정보를 대조합니다.
            const currentUser = JSON.parse(localStorage.getItem('user')); // 로컬 스토리지 활용 시
            
            if (result.data.author.nickname === currentUser.nickname) {
                location.href = `edit_post.html?id=${postId}`;
            } else {
                alert("본인이 작성한 글만 수정할 수 있습니다.");
            }
        } else {
            // 백엔드에서 설정한 에러 메시지(예: PERMISSION_DENIED) 출력
            alert(result.message || "수정 권한이 없습니다.");
        }
    } catch (error) {
        console.error("권한 확인 중 오류:", error);
        alert("서버 통신 중 오류가 발생했습니다.");
    }
});


// 게시글 삭제 모달 열기
const postDeleteBtn = document.getElementById('postDeleteBtn');
if (postDeleteBtn) {
    postDeleteBtn.addEventListener('click', () => {
        postDeleteModal.style.display = 'flex';
        toggleBodyScroll(true);
    });
}

// 게시글 삭제 확정 (API 연동)
document.getElementById('postDelConfirm').addEventListener('click', async () => {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/posts/${postId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            alert("게시글이 삭제되었습니다.");
            location.href = 'board.html';
        } else {
            const result = await response.json();
            alert(result.message || "삭제 권한이 없습니다.");
        }
    } catch (error) {
        console.error("게시글 삭제 실패:", error);
    }
});

// 댓글 삭제 모달 열기
window.openCommentModal = function(id) {
    targetCommentIdToDelete = id;
    commentDeleteModal.style.display = 'flex';
    toggleBodyScroll(true);
};

// 댓글 삭제 확정 (API 연동)
document.getElementById('cmtDelConfirm').addEventListener('click', async () => {
    if (!targetCommentIdToDelete) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/comments/${targetCommentIdToDelete}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            commentDeleteModal.style.display = 'none';
            toggleBodyScroll(false);
            
            // 삭제 후 댓글 수 업데이트 및 목록 새로고침
            commentCount.textContent = formatNumber(result.data.commentCount);
            loadComments(); 
            
            // 수정 중이던 댓글을 삭제했다면 초기화
            if (editingCommentId === targetCommentIdToDelete) {
                editingCommentId = null;
                commentInput.value = "";
                commentSubmitBtn.textContent = "댓글 등록";
                checkCommentBtn();
            }
        }
    } catch (error) {
        console.error("댓글 삭제 실패:", error);
    }
});

// 모달 취소 버튼들 공통 처리
document.getElementById('postDelCancel').addEventListener('click', () => {
    postDeleteModal.style.display = 'none';
    toggleBodyScroll(false);
});

document.getElementById('cmtDelCancel').addEventListener('click', () => {
    commentDeleteModal.style.display = 'none';
    toggleBodyScroll(false);
});

// 뒤로가기 버튼
if (backBtn) {
    backBtn.addEventListener('click', () => location.href = 'board.html');
}

// 초기화 함수 실행 (함수명 일치 확인)
initPage();