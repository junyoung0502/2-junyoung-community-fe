// 1. 요소 가져오기
const passwordInput = document.getElementById('password');
const passwordCheckInput = document.getElementById('passwordCheck');
const pwHelper = document.getElementById('pwHelper');
const pwCheckHelper = document.getElementById('pwCheckHelper');
const editBtn = document.getElementById('editBtn');
const toast = document.getElementById('toast');

// 비밀번호 정규식 (8~20자, 대문자/소문자/숫자/특수문자 포함)
const pwPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

// 2. 유효성 검사 함수
function validate() {
    const pwVal = passwordInput.value;
    const checkVal = passwordCheckInput.value;
    let isPwValid = false;
    let isCheckValid = false;

    // 1) 비밀번호 규칙 검사
    if (pwVal === "") {
        pwHelper.textContent = "*비밀번호를 입력해주세요.";
        pwHelper.classList.remove('invisible');
        isPwValid = false;
    } else if (!pwPattern.test(pwVal)) {
        pwHelper.textContent = "*비밀번호는 8~20자이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
        pwHelper.classList.remove('invisible');
        isPwValid = false;
    } else if (checkVal !== "" && pwVal !== checkVal) {
        // ★ [요청사항 반영] 확인란이 비어있지 않은데, 서로 다르면 여기에도 에러 표시
        pwHelper.textContent = "*비밀번호가 일치하지 않습니다.";
        pwHelper.classList.remove('invisible');
        isPwValid = false; 
    } else {
        // 모든 조건 통과
        pwHelper.classList.add('invisible');
        isPwValid = true;
    }

    // 2) 비밀번호 일치 검사
    if (checkVal === "") {
        pwCheckHelper.textContent = "*비밀번호를 한번 더 입력해주세요.";
        pwCheckHelper.classList.remove('invisible');
        isCheckValid = false;
    } else if (pwVal !== checkVal) {
        pwCheckHelper.textContent = "*비밀번호가 일치하지 않습니다.";
        pwCheckHelper.classList.remove('invisible');
        isCheckValid = false;
    } else {
        // 일치함
        pwCheckHelper.classList.add('invisible');
        isCheckValid = true;
    }

    // 3) 버튼 활성화 여부
    if (isPwValid && isCheckValid) {
        editBtn.disabled = false;
        editBtn.classList.add('active');
    } else {
        editBtn.disabled = true;
        editBtn.classList.remove('active');
    }
}

// 입력할 때마다 검사
passwordInput.addEventListener('input', validate);
passwordCheckInput.addEventListener('input', validate);


// 3. 수정하기 버튼 클릭
editBtn.addEventListener('click', async function() {
    const newPassword = passwordInput.value;
    const userId = localStorage.getItem('userId');

    // [핵심] 서버로 비밀번호 변경 요청 전송
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${userId}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            // 현재 비밀번호(currentPassword)는 빈 값으로 보내거나, 
            // 백엔드 PasswordChangeRequest 모델 정의에 따라 조절합니다.
            body: JSON.stringify({ 
                currentPassword: "", // 사용하지 않으므로 빈 값 전송
                newPassword: newPassword 
            }),
            credentials: 'include'
        });

        if (response.ok) {
            // [성공 공정]
            toast.classList.add('show');
            toast.textContent = "비밀번호 수정 완료";

            setTimeout(() => {
                toast.classList.remove('show');
                // 보안을 위해 로그아웃 처리 후 로그인 페이지로 이동하는 것이 정석입니다.
                alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
                localStorage.clear();
                location.href = "login.html";
            }, 1500);
        } else {
            const result = await response.json();
            alert("수정 실패: " + (result.detail || "알 수 없는 오류"));
        }
    } catch (error) {
        console.error("통신 오류:", error);
        alert("서버와 통신할 수 없습니다.");
    }
});



// ============================================================
// ★ 헤더 프로필 & 드롭다운 기능 (공통 코드)
// ============================================================
const profileIcon = document.getElementById('profileIcon');
const userDropdown = document.getElementById('userDropdown');

// 1. 헤더 프로필 이미지 설정
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

// 2. 드롭다운 토글
profileIcon.addEventListener('click', function(event) {
    event.stopPropagation(); 
    userDropdown.classList.toggle('show');
});

document.addEventListener('click', function(event) {
    if (!profileIcon.contains(event.target)) {
        userDropdown.classList.remove('show');
    }
});

validate();