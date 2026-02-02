// 1. 요소 가져오기
const backBtn = document.getElementById('backBtn');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const helperText = document.getElementById('helperText');
const postImageInput = document.getElementById('postImage');
const fileNameDisplay = document.getElementById('fileName');
const submitBtn = document.getElementById('submitBtn');

let uploadedImagePath = null; // [추가] 서버에서 받은 이미지 경로를 저장할 변수

// 2. 유효성 검사 및 버튼 상태 변경 (색상만 변경)
function checkInputState() {
    const titleVal = titleInput.value.trim();
    const contentVal = contentInput.value.trim();

    // 둘 다 내용이 있으면 'active' 클래스 추가
    if (titleVal.length > 0 && contentVal.length > 0) {
        submitBtn.classList.add('active'); // #7F6AEE 색상 적용
        helperText.classList.add('invisible'); // 에러 메시지 숨김
    } else {
        submitBtn.classList.remove('active'); // #ACA0EB 색상 복귀
    }
}

// 3. 실제 DB에 게시글을 저장하는 함수 (새로 추가)
async function createPost() {
    const titleVal = titleInput.value.trim();
    const contentVal = contentInput.value.trim();

    // 프론트엔드에서도 백엔드 규격과 동일하게 1차 검사 (Poka-yoke)
    if (titleVal.length < 2) {
        alert("제목은 최소 2자 이상 입력해주세요.");
        return;
    }
    if (contentVal.length < 5) {
        alert("내용은 최소 5자 이상 입력해주세요.");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: titleVal,    // 백엔드 PostCreateRequest의 title 필드
                content: contentVal,  // 백엔드 PostCreateRequest의 content 필드
                image: uploadedImagePath          // image는 필수가 아니므로 null 전송
            }),
            credentials: 'include' 
        });

        const result = await response.json();

        if (response.ok) {
            alert("게시글이 성공적으로 등록되었습니다.");
            location.href = "board.html";
        } else {
            // [에러 디버깅 핵심] 400 에러 시 서버가 보낸 메시지를 상세히 출력
            console.error("서버 거절 상세 원인:", result);
            
            // 만약 서버에서 pydantic 에러를 그대로 보내준다면 구체적인 이유가 result.data 등에 있을 수 있음
            alert(`등록 실패: ${result.message}\n(제목 2자, 내용 5자 이상인지 확인하세요)`);
        }
    } catch (err) {
        console.error("네트워크 오류:", err);
        alert("서버와 통신할 수 없습니다.");
    }
}

// 3. 이벤트 리스너

// 입력 감지
titleInput.addEventListener('input', checkInputState);
contentInput.addEventListener('input', checkInputState);

// 파일 선택 시 파일명 변경
postImageInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
        
        // [추가] 선택 즉시 서버에 업로드 시도
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/posts/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok) {
                uploadedImagePath = result.data.imagePath; 
                fileNameDisplay.textContent = file.name;
            }
        } catch (err) {
            console.error("이미지 업로드 실패:", err);
        }
    }
});

// 완료 버튼 클릭
submitBtn.addEventListener('click', function(e) {
    e.preventDefault(); // 폼 제출 기본 동작 방지

    const titleVal = titleInput.value.trim();
    const contentVal = contentInput.value.trim();

    // 최종 유효성 검사 후 서버 전송
    if (titleVal.length === 0 || contentVal.length === 0) {
        helperText.classList.remove('invisible'); // 에러 메시지 표시
        return;
    }

    createPost(); // 실제 저장 함수 실행
});

// 뒤로가기
backBtn.addEventListener('click', () => {
    // history.back();
    location.href = "board.html";
});

document.addEventListener('DOMContentLoaded', checkInputState);