// 1. 요소 가져오기
const backBtn = document.getElementById('backBtn');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const helperText = document.getElementById('helperText');
const postImageInput = document.getElementById('postImage');
const fileNameDisplay = document.getElementById('fileName');
const submitBtn = document.getElementById('submitBtn');

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

// 3. 이벤트 리스너

// 입력 감지
titleInput.addEventListener('input', checkInputState);
contentInput.addEventListener('input', checkInputState);

// 파일 선택 시 파일명 변경
postImageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
        fileNameDisplay.style.color = "black"; // 파일명은 검은색으로
    } else {
        fileNameDisplay.textContent = "파일을 선택해주세요.";
        fileNameDisplay.style.color = "#999"; // 기본 문구는 회색
    }
});

// 완료 버튼 클릭
submitBtn.addEventListener('click', function() {
    const titleVal = titleInput.value.trim();
    const contentVal = contentInput.value.trim();

    // 유효성 검사 실패 시
    if (titleVal.length === 0 || contentVal.length === 0) {
        helperText.classList.remove('invisible'); // 헬퍼 텍스트 표시
        return; // 전송 중단
    }

    // 성공 시 (여기서는 게시판으로 이동)
    // 실제로는 서버로 데이터 전송 로직이 들어감
    alert("게시글이 등록되었습니다.");
    location.href = "board.html";
});

// 뒤로가기
backBtn.addEventListener('click', () => {
    // history.back();
    location.href = "board.html";
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