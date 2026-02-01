// public/js/board.js

// 1. 요소 가져오기
const postList = document.getElementById('postList');

function formatNumber(num) {
    if (num >= 1000) return Math.floor(num / 1000) + 'k';
    return num;
}

// 2. 서버에서 게시글 데이터를 가져오고 화면에 그리는 통합 함수
async function loadAndRenderPosts() {
    try {
        // 백엔드 API 주소에 맞춰 경로 수정 (예: /api/v1/posts)
        const response = await fetch('http://127.0.0.1:8000/api/v1/posts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            // 세션 기반 로그인이므로 쿠키를 포함하여 요청
            credentials: 'include' 
        });

        const result = await response.json();

        if (response.ok) {
            // 서버 응답 구조가 { "message": "...", "data": [...] }인 경우 result.data 사용
            const posts = result.data.posts
            renderPostList(posts);
        } else {
            console.error("데이터 로드 실패:", result.message);
            alert("게시글을 불러올 수 없습니다.");
        }
    } catch (error) {
        console.error("서버 통신 오류:", error);
        alert("게시글을 불러오는 데 실패했습니다.");
    }
}

// 3. 게시물 리스트를 순회하며 화면에 추가하는 함수
function renderPostList(posts) {
    postList.innerHTML = ""; // 기존 목록 비우기

    if (!posts || posts.length === 0) {
        postList.innerHTML = "<p style='text-align:center; padding:20px;'>게시글이 없습니다.</p>";
        return;
    }

    posts.forEach(post => {
        const postEl = createPostElement(post);
        postList.appendChild(postEl);
    });
}

// 4. 개별 게시물 카드를 만드는 함수
function createPostElement(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    // 클릭 시 상세 페이지 이동 (글 ID를 쿼리 스트링으로 전달)
    card.onclick = () => {
        location.href = `post_detail.html?id=${post.postId}`;
    };

    // 제목 길이에 따른 말줄임 처리 (JS 혹은 CSS로 처리 가능)
    let displayTitle = post.title;
    if (displayTitle.length > 26) {
        displayTitle = displayTitle.substring(0, 26) + "...";
    }
    const formattedDate = post.createdAt.replace('T', ' ').split('.')[0];
    // 서버 데이터 키값(likes, comments, views 등)이 백엔드 모델과 일치하는지 확인 필수
    card.innerHTML = `
        <h3 class="card-title">${displayTitle}</h3>
        <div class="card-info">
            <div class="stats">
                <span>좋아요 ${post.likeCount || 0}</span>
                <span>댓글 ${post.commentCount || 0}</span>
                <span>조회수 ${post.viewCount || 0}</span>
            </div>
            <div class="date">${formattedDate}</div>
        </div>
        <div class="card-author">
            <div class="author-img"></div> 
            <span class="author-name">${post.author.nickname}</span>
        </div>
    `;
    return card;
}

// 5. 페이지 로드 시 실행
loadAndRenderPosts();