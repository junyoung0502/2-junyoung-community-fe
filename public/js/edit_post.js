// 1. 더미 데이터 (기존 게시글 정보)
const mockPost = {
    id: 1,
    title: "제목 1",
    content: "무엇을 얘기할까요? 아무말이라면, 삶은 항상 놀라운 모험이라고 생각합니다...\n(생략)",
    imageName: "기존 파일 명.png" 
};

// 2. 요소 가져오기
const backBtn = document.getElementById('backBtn');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const helperText = document.getElementById('helperText');
const postImageInput = document.getElementById('postImage');
const fileNameDisplay = document.getElementById('fileName');
const submitBtn = document.getElementById('submitBtn');
const toast = document.getElementById('toast');

// 3. 초기화 (기존 데이터 불러오기)
function init() {
    titleInput.value = mockPost.title;
    contentInput.value = mockPost.content;
    
    // [요구사항 3] 기존 이미지 파일명 표시
    if (mockPost.imageName) {
        fileNameDisplay.textContent = mockPost.imageName;
    } else {
        fileNameDisplay.textContent = "선택된 파일 없음";
    }
    
    // 초기 상태에서도 유효성 검사 실행
    checkValidation();
}

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
        fileNameDisplay.textContent = mockPost.imageName || "선택된 파일 없음";
    }
});

// [요구사항 4] 수정하기 버튼 클릭
submitBtn.addEventListener('click', function() {
    // 1. 토스트 메시지 띄우기
    toast.classList.add('show');
    toast.textContent = "수정 완료"; 

    // 2. 잠시 후 상세 페이지로 이동
    setTimeout(() => {
        toast.classList.remove('show');
        location.href = "post_detail.html";
    }, 1500);
});

// 뒤로가기
backBtn.addEventListener('click', () => {
    // history.back(); 또는 명시적 이동
    location.href = "post_detail.html";
});


// ============================================================
// 헤더 프로필 & 드롭다운 (공통)
// ============================================================
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

// 실행
init();