// 1. 요소 가져오기
const profileInput = document.getElementById('profileImg');
const profilePreview = document.querySelector('.preview-circle img');
const previewContainer = document.querySelector('.preview-circle');

const emailInput = document.getElementById('email');
const nicknameInput = document.getElementById('nickname');
const nicknameHelper = document.querySelector('#nickname + .helper-text');
const editBtn = document.getElementById('editBtn');
const withdrawBtn = document.getElementById('withdrawBtn');
const toast = document.getElementById('toast');

let currentUser = null; // let으로 변경 (수정 가능하게)
const storedUser = localStorage.getItem('user');

if (storedUser) {
    currentUser = JSON.parse(storedUser);
}

// 닉네임 중복 검사용 더미 데이터
const mockNicknames = ["홍길동", "어댑터"]; // '관리자'는 내꺼니까 제외

// 3. 초기화 함수: 화면이 켜지면 데이터 채워넣기
function init() {
    emailInput.value = currentUser.email;
    nicknameInput.value = currentUser.nickname;
    
    // 이미지가 있다면 표시
    if (currentUser.profileImage) {
        profilePreview.src = currentUser.profileImage;
        profilePreview.classList.remove('hidden');
        previewContainer.classList.add('uploaded');
    }

    const headerProfileIcon = document.querySelector('.user-avatar');
        if (headerProfileIcon && currentUser.profileImage) {
            headerProfileIcon.style.backgroundImage = `url('${currentUser.profileImage}')`;
            headerProfileIcon.style.backgroundSize = 'cover';
            headerProfileIcon.style.backgroundPosition = 'center';
        }
}

// 4. 프로필 사진 변경 로직 (Signup과 동일)
profileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profilePreview.src = e.target.result;
            profilePreview.classList.remove('hidden');
            previewContainer.classList.add('uploaded');
        };
        reader.readAsDataURL(file);
    } else {
        // 취소 시 (기존 이미지 유지할지, 삭제할지는 기획에 따라 다름)
        // 여기선 단순하게 유지
    }
    checkButtonState(); // 버튼 색상 갱신
});

// 5. 닉네임 유효성 검사 (Signup과 동일)
function validateNickname() {
    const val = nicknameInput.value.trim();
    
    if (val === "") {
        nicknameHelper.textContent = "*닉네임을 입력해주세요.";
        nicknameHelper.classList.remove('invisible');
        return false;
    } else if (val.length > 10) {
        nicknameHelper.textContent = "*닉네임은 최대 10자 까지 작성 가능합니다.";
        nicknameHelper.classList.remove('invisible');
        return false;
    } else if (mockNicknames.includes(val) && val !== currentUser.nickname) { 
        // (중요) 내 원래 닉네임은 중복 검사에서 제외해야 함
        nicknameHelper.textContent = "*중복된 닉네임 입니다.";
        nicknameHelper.classList.remove('invisible');
        return false;
    } else {
        nicknameHelper.classList.add('invisible');
        return true;
    }
}

nicknameInput.addEventListener('focusout', validateNickname);
nicknameInput.addEventListener('input', checkButtonState);

// 6. 버튼 활성화 로직
function checkButtonState() {
    if (!currentUser) return;

    const nickVal = nicknameInput.value.trim();
    // 닉네임 유효성 조건
    const isNicknameValid = nickVal.length > 0 && nickVal.length <= 10 && 
                            (!mockNicknames.includes(nickVal) || nickVal === currentUser.nickname);
    
    if (isNicknameValid) {
        editBtn.style.backgroundColor = "#7F6AEE"; // 활성 색상
        editBtn.disabled = false;
    } else {
        editBtn.style.backgroundColor = "#ACA0EB"; // 비활성 색상
        editBtn.disabled = true;
    }
}

// 7. 수정하기 버튼 클릭 (토스트 메시지 띄우기)
editBtn.addEventListener('click', function() {
    // 1. 현재 화면에 있는 정보로 객체 업데이트
    currentUser.nickname = nicknameInput.value;
    
    // 이미지가 화면에 보이면(업로드 상태면) src 저장
    if (!profilePreview.classList.contains('hidden')) {
        currentUser.profileImage = profilePreview.src;
    }

    // 2. 브라우저 저장소(localStorage)에 덮어쓰기
    localStorage.setItem('user', JSON.stringify(currentUser));

    // 3. 토스트 메시지 보이기
    toast.classList.add('show');
    toast.textContent = "수정 완료";

    setTimeout(() => {
        toast.classList.remove('show');
    }, 1500);
});


// 8. 회원탈퇴 버튼 클릭
// ★ 모달 관련 요소 가져오기 (맨 위에 변수 선언들과 함께 추가해도 됩니다)
const withdrawModal = document.getElementById('withdrawModal');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');

// 8. 회원탈퇴 버튼 클릭 (수정됨)
withdrawBtn.addEventListener('click', function(e) {
    e.preventDefault(); 
    // 기존의 confirm() 삭제하고 모달 띄우기
    withdrawModal.style.display = 'flex'; 
});

// ★ [추가] 모달 내부 버튼 동작

// 9. 모달 "취소" 클릭 -> 모달 닫기
modalCancelBtn.addEventListener('click', function() {
    withdrawModal.style.display = 'none';
});

// 10. 모달 "확인" 클릭 -> 진짜 탈퇴 진행
modalConfirmBtn.addEventListener('click', function() {
    // 정보 삭제
    localStorage.removeItem('user');
    
    // 모달 닫기 (혹은 바로 이동하므로 생략 가능)
    withdrawModal.style.display = 'none';
    
    // 로그인 페이지로 이동
    location.href = "login.html";
});

// (옵션) 모달 바깥 배경 누르면 닫기
withdrawModal.addEventListener('click', function(e) {
    if (e.target === withdrawModal) {
        withdrawModal.style.display = 'none';
    }
});

// 초기화 실행
init();