// 2. 요소 가져오기
const backBtn = document.getElementById('backBtn');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const helperText = document.getElementById('helperText');
const postImageInput = document.getElementById('postImage');
const fileNameDisplay = document.getElementById('fileName');
const submitBtn = document.getElementById('submitBtn');
const toast = document.getElementById('toast');
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

let currentImagePath = ""; // 기존 이미지 경로를 저장할 변수

async function init() {
    if (!postId) {
        alert("잘못된 접근입니다.");
        location.href = "board.html";
        return;
    }

    try {
        // 백엔드 상세 조회 API 호출
        const response = await fetch(`http://127.0.0.1:8000/api/v1/posts/${postId}`, {
            method: 'GET',
            credentials: 'include' // 세션 유지를 위해 필요
        });
        const result = await response.json();

        if (response.ok) {
            // 가져온 데이터를 입력창에 채움
            titleInput.value = result.data.title;
            contentInput.value = result.data.content;
            
            // [추가] 기존에 이미지가 있었다면 경로 저장
            currentImagePath = result.data.image_url || ""; 
            fileNameDisplay.textContent = result.data.image_url ? "기존 이미지 유지 중" : "선택된 파일 없음";
            
            checkValidation();
        } else {
            alert(result.detail || "데이터를 불러오는데 실패했습니다.");
        }
    } catch (err) {
        console.error("서버 통신 오류:", err);
    }
}

// [추가] 파일 선택 시 서버에 즉시 업로드 (프로필 수정 로직 활용)
postImageInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    fileNameDisplay.textContent = file.name;

    const formData = new FormData();
    formData.append('image', file);

    try {
        // 이미지를 먼저 서버에 업로드하여 경로를 받아옵니다.
        const response = await fetch(`http://127.0.0.1:8000/api/v1/uploads`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const result = await response.json();
        if (response.ok) {
            currentImagePath = result.data.imagePath; // 서버가 반환한 경로 저장
        }
    } catch (err) {
        console.error("이미지 업로드 실패:", err);
    }
});

// 4. 유효성 검사 함수
function checkValidation() {
    const titleVal = titleInput.value.trim();
    const contentVal = contentInput.value.trim();

    // [요구사항 2] 모든 정보 입력 시 버튼 활성화
    // 제목, 내용이 모두 비어있지 않아야 함
    const isValid = titleVal.length > 0 && contentVal.length > 0;

    if (isValid) {
        // 활성화: 색상 #7F6AEE
        submitBtn.classList.add('active');
        submitBtn.disabled = false;
        helperText.classList.add('invisible'); // 헬퍼 텍스트 숨김
    } else {
        // 비활성화: 색상 #ACA0EB
        submitBtn.classList.remove('active');
        submitBtn.disabled = true;
        helperText.classList.remove('invisible'); // 헬퍼 텍스트 보임
    }
}

async function updatePost() {
    const titleVal = titleInput.value.trim();
    const contentVal = contentInput.value.trim();

    try {
        // 서버에 PATCH 요청 전송 (데이터 수정)
        const response = await fetch(`http://127.0.0.1:8000/api/v1/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: titleVal,
                content: contentVal,
                image_url: currentImagePath // 업로드된 이미지 경로 사용
            }),
            credentials: 'include' // 작성자 권한 확인용 세션 포함
        });

        const result = await response.json();

        if (response.ok) {
            // 원본의 토스트 UI 로직 활용
            toast.classList.add('show');
            toast.textContent = "수정 완료";

            setTimeout(() => {
                toast.classList.remove('show');
                // 수정 완료 후 해당 게시글 상세 페이지로 이동
                location.href = `post_detail.html?id=${postId}`;
            }, 1500);
        } else {
            console.error("서버 거절 사유:", result);
            alert(`수정 실패: ${result.detail || "권한이 없습니다."}`);
        }
    } catch (err) {
        console.error("수정 요청 중 오류:", err);
        alert("서버 통신 오류가 발생했습니다.");
    }
}

// 5. 이벤트 리스너

// 입력 감지 (타이핑 할 때마다 검사)
titleInput.addEventListener('input', checkValidation);
contentInput.addEventListener('input', checkValidation);

// [요구사항 3] 파일 선택 시 파일명 변경
postImageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
    } else {
        // 파일 선택 취소 시 기존 파일명 유지 (또는 없음 처리)
        // 여기서는 기존 파일이 있었으면 유지하는 로직
        fileNameDisplay.textContent = currentImagePath ? "기존 이미지 유지 중" : "선택된 파일 없음";
    }
});

// 완료 버튼 클릭 시 실제 수정 함수 실행
submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    updatePost();
});

// 뒤로가기
backBtn.addEventListener('click', () => {
    // history.back(); 또는 명시적 이동
    location.href = "post_detail.html";
});

// 실행
init();