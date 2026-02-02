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

const userId = localStorage.getItem('userId');

// [추가] 버튼 활성화 상태 제어 함수
function checkButtonState() {
    const val = nicknameInput.value.trim();
    // 닉네임이 2자 이상이고 비어있지 않을 때만 버튼 활성화
    if (val.length >= 2) {
        editBtn.disabled = false;
        editBtn.style.backgroundColor = "#7F63F2"; // 활성 색상
        editBtn.style.cursor = "pointer";
    } else {
        editBtn.disabled = true;
        editBtn.style.backgroundColor = "#ACA0EB"; // 비활성 색상
        editBtn.style.cursor = "not-allowed";
    }
}

async function init() {
    if (!userId) return (location.href = "login.html");
    
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${userId}`, {
            method: 'GET',
            credentials: 'include'
        });
        const result = await response.json();
        if (response.ok) {
            nicknameInput.value = result.data.nickname;
            document.getElementById('email').value = result.data.email;
            
            if (result.data.profileImage) {
                profilePreview.src = result.data.profileImage;
                profilePreview.classList.remove('hidden'); // hidden 클래스가 있다면 제거
            }
            checkButtonState(); // 초기 상태 세팅
        }
    } catch (e) { console.error("로드 실패:", e); }
}

nicknameInput.addEventListener('input', checkButtonState);

// 서버에서 받은 이미지 경로를 임시 저장할 변수
let serverSavedImagePath = ""; 

profileInput.addEventListener('change', async function() {
    const file = this.files[0];
    if (!file) return;

    // 1. 서버로 파일 업로드 전송
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/users/upload-profile', {
            method: 'POST',
            body: formData,
            // credentials: 'include' // 세션이 필요하다면 추가
        });

        const result = await response.json();
        if (response.ok) {
            // 2. 서버가 준 상대 경로 저장 (예: /public/images/abc.png)
            serverSavedImagePath = result.data.profileImageUrl;
            
            // 3. 화면 미리보기 (이때는 로컬 브라우저 경로 사용 가능)
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePreview.src = e.target.result;
                profilePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    } catch (err) {
        console.error("이미지 업로드 실패:", err);
        alert("이미지 업로드 중 오류가 발생했습니다.");
    }
});

// 4. 닉네임 입력 이벤트 (실시간 유효성 검사)
nicknameInput.addEventListener('input', function() {
    const value = this.value.trim();
    nicknameHelper.classList.remove('invisible');

    if (value.length < 2) {
        nicknameHelper.textContent = "*닉네임은 2자 이상 입력해주세요.";
        nicknameHelper.style.color = "red";
    } else {
        nicknameHelper.textContent = "올바른 닉네임 형식입니다.";
        nicknameHelper.style.color = "#666";
    }
    checkButtonState();
});


// 7. 수정 완료 버튼 클릭 이벤트
editBtn.addEventListener('click', async function(e) {
    e.preventDefault(); // 폼 제출 방지

    const newNickname = nicknameInput.value.trim(); // 변수명을 정확히 확인하세요.
    
    const updateData = {
        nickname: newNickname,
        profileImage: serverSavedImagePath || profilePreview.src.replace('http://127.0.0.1:8000', '') // <img> 태그의 현재 src 값을 가져옴
    };

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData), // 전체 데이터를 보냄
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok) {
            try {
                // [추가] DB에서 최신 정보를 다시 가져옵니다 (싱크 맞추기)
                const userRes = await fetch(`http://127.0.0.1:8000/api/v1/users/${userId}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const userResult = await userRes.json();

                if (userRes.ok) {
                    // [핵심] DB에서 가져온 최신 데이터(Full URL 포함)로 Local Storage 갱신
                    // header.js는 이 'user' 객체 안의 profileImage를 보고 상단 이미지를 띄웁니다.
                    const updatedUserData = {
                        userId: userResult.data.userId,
                        email: userResult.data.email,
                        nickname: userResult.data.nickname,
                        profileImage: userResult.data.profileImage, // 백엔드에서 조립된 전체 주소
                        status: userResult.data.status
                    };

                    // Local Storage에 저장 (기존 user 객체를 덮어씀)
                    localStorage.setItem('user', JSON.stringify(updatedUserData));
                    localStorage.setItem('nickname', updatedUserData.nickname);
                }
            } catch (syncError) {
                console.error("헤더 데이터 동기화 실패:", syncError);
            }

            // [성공 알림 및 페이지 이동]
            toast.textContent = "수정 완료";
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
                location.href = "board.html"; // 페이지가 이동하면서 header.js가 새 정보를 읽어옵니다.
            }, 1500);
        }
    } catch (error) {
        console.error("통신 오류:", error);
    }
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
modalConfirmBtn.addEventListener('click', async function() {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${userId}`, {
            method: 'DELETE', // HTTP 메서드는 관례상 DELETE를 그대로 사용해도 무방합니다.
            credentials: 'include'
        });

        if (response.ok) {
            alert("탈퇴 처리가 완료되었습니다. 그동안 이용해주셔서 감사합니다.");
            
            // 공정 마무리: 로컬 세션 제거 및 로그인 창으로 배송
            localStorage.clear();
            location.href = "login.html"; 
        } else {
            const result = await response.json();
            alert("탈퇴 실패: " + (result.detail || "오류 발생"));
        }
    } catch (error) {
        console.error("통신 에러:", error);
    }
});

// (옵션) 모달 바깥 배경 누르면 닫기
withdrawModal.addEventListener('click', function(e) {
    if (e.target === withdrawModal) {
        withdrawModal.style.display = 'none';
    }
});

// 초기화 실행
init();