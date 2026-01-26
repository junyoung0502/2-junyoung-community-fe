function checkLogin() {
    // 1. HTML에서 id가 'userid'인 칸의 값을 가져온다.
    const idBox = document.getElementById('userid');
    const idValue = idBox.value;

    // 2. 판단한다 (뇌의 역할)
    if (idValue == "") {
        // 값이 비었으면 혼낸다
        alert("아이디를 입력해주세요!");
        idBox.focus(); // 커서를 다시 아이디 칸으로 옮겨줌
    } else {
        // 값이 있으면 칭찬하고 페이지를 넘긴다
        alert(idValue + "님 환영합니다!");
        
        // ★ JS로 페이지 이동하는 코드
        location.href = "board.html"; 
    }
}


// 1. 필요한 요소들을 가져옵니다.
const idInput = document.getElementById('userid');
const pwInput = document.getElementById('userpw');
const helperText = document.getElementById('helperText');
const loginBtn = document.querySelector('.login-btn');

// 2. 유효성 검사 기준 (정규표현식)
const emailPattern = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
const pwPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

// 2. 입력 상태를 감시하는 함수를 만듭니다.
function checkInput() {
    const idValue = idInput.value.trim();
    const pwValue = pwInput.value.trim();
    
    // 기본 상태: 버튼 비활성화
    if (idValue.length > 0 && pwValue.length > 0) {
        loginBtn.classList.add('active');
        loginBtn.disabled = false;
    } else {
        loginBtn.classList.remove('active');
        loginBtn.disabled = true;
    }

// 1순위: 이메일 입력 안 함
    if (idValue.length === 0) {
        helperText.textContent = "* 이메일을 입력해주세요.";
        return;
    }
    
    // 2순위: 이메일 형식 틀림
    if (!emailPattern.test(idValue)) {
        helperText.textContent = "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)";
        return;
    }

    // 3순위: 비밀번호 입력 안 함
    if (pwValue.length === 0) {
        helperText.textContent = "* 비밀번호를 입력해주세요";
        return;
    }

    // 4순위: 비밀번호 형식 틀림
    if (!pwPattern.test(pwValue)) {
        helperText.textContent = "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
        return;
    }

    // 5순위: 모두 통과
    helperText.textContent = ""; 
}

// 4. 로그인 시도 (버튼 클릭 시)
function attemptLogin() {
    const idValue = idInput.value;
    const pwValue = pwInput.value;

    if (idValue === "jylee0005@gmail.com" && pwValue === "dlwnsdud") {
        alert(idValue + "님 환영합니다!");

        // ★ [핵심] 로그인 성공 시 사용자 정보를 브라우저(localStorage)에 저장
        const userInfo = {
            email: idValue,
            nickname: "관리자",   // 초기 닉네임 설정
            profileImage: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"      // 초기엔 이미지 없음
        };
        localStorage.setItem('user', JSON.stringify(userInfo));

        location.href = "board.html";
    } else {
        helperText.textContent = "*아이디 또는 비밀번호를 확인해주세요";
    }
}

// 3. 키보드를 뗄 때(keyup)마다 함수를 실행시킵니다.
idInput.addEventListener('keyup', checkInput);
pwInput.addEventListener('keyup', checkInput);