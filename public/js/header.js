/**
 * 헤더 공통 로직: 프로필 이미지 설정 및 드롭다운 제어
 */
document.addEventListener('DOMContentLoaded', () => {
    const profileIcon = document.getElementById('profileIcon');
    const userDropdown = document.getElementById('userDropdown');
    const headerProfileIcon = document.querySelector('.user-avatar');

    // 1. LocalStorage에서 사용자 정보 불러와서 프로필 이미지 설정
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const currentUser = JSON.parse(storedUser);

        if (headerProfileIcon && currentUser.profileImage) {
            headerProfileIcon.style.backgroundImage = `url('${currentUser.profileImage}')`;
            headerProfileIcon.style.backgroundSize = 'cover';
            headerProfileIcon.style.backgroundPosition = 'center';
        }
    }

    // 2. 드롭다운 토글 제어
    if (profileIcon && userDropdown) {
        profileIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        // 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!profileIcon.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
});