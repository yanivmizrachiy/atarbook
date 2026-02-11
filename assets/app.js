// CONFIGURATION
const HUB_CONFIG = {
    profiles: [
        {
            id: 'g1',
            label: 'חשבון גוגל 1',
            heroButton: {
                title: 'GPT',
                url: 'https://chat.openai.com/',
                iconType: 'gptLogo'
            },
            fastAccessLinks: [
                { title: 'WhatsApp Web', url: 'https://web.whatsapp.com/', icon: '💬' },
                { title: 'Microsoft Portal', url: 'https://www.office.com/', icon: '🪟' },
                { title: 'Youtube', url: 'https://youtube.com/', icon: '▶️' }
            ],
            googleMenuLinks: [
                { title: 'Drive', url: 'https://drive.google.com/?authuser=0', icon: '🗂️' },
                { title: 'Gmail', url: 'https://mail.google.com/mail/u/0/#inbox', icon: '✉️' },
                { title: 'Calendar', url: 'https://calendar.google.com/calendar/u/0/r', icon: '🗓️' },
                { title: 'KLM Notebooks', url: 'https://keep.google.com/u/0/', icon: '📓' }
            ]
        },
        {
            id: 'g2',
            label: 'חשבון גוגל 2',
            // Special Hero Buttons for g2
            classroomHero: {
                title: 'קלאסרום',
                // Icon: Board
                items: [
                    { title: "כיתה ז", url: "https://classroom.google.com/u/0/c/ODE2OTc5MzE4MTAx" },
                    { title: "כיתה ט1 מדעית", url: "https://classroom.google.com/u/0/w/NjMwNDg0ODcxNzc4/t/all" },
                    { title: "ח1 מדעית", url: "https://classroom.google.com/u/0/c/NzE2Njg2NDU3Mjc1" },
                    { title: "כיתה ח", url: "https://classroom.google.com/u/0/c/ODAyNDU5MTIxMzQ3" }
                ]
            },
            moodleHero: {
                title: 'מודל',
                // Icon: Hat
                items: [
                    { title: "מרחב ז", url: "https://moodlemoe.lms.education.gov.il/course/view.php?id=632" },
                    { title: "מרחב ח", url: "https://moodlemoe.lms.education.gov.il/course/view.php?id=2014" },
                    { title: "מרחב ט", url: "https://moodlemoe.lms.education.gov.il/course/view.php?id=259" }
                ]
            },
            fastAccessLinks: [
                { title: 'WhatsApp Business', url: 'https://web.whatsapp.com/', icon: '🏪' },
                { title: 'Edu Portal', url: 'https://education.microsoft.com/', icon: '🎓' }
            ],
            googleMenuLinks: [
                { title: 'Drive (School)', url: 'https://drive.google.com/?authuser=1', icon: '🗂️' },
                { title: 'Gmail (School)', url: 'https://mail.google.com/mail/u/1/#inbox', icon: '✉️' },
                { title: 'Calendar (School)', url: 'https://calendar.google.com/calendar/u/1/r', icon: '🗓️' },
                { title: 'Classroom', url: 'https://classroom.google.com/u/1/h', icon: '🏫' }
            ]
        }
    ]
};

// STATE
let activeProfileId = localStorage.getItem('activeProfileId') || 'g1';

// DOM ELEMENTS
const profileLabelEl = document.getElementById('active-profile-label');
const mainSwitchBtnEl = document.getElementById('main-account-switch-btn');
const heroSectionEl = document.getElementById('hero-section');
const fastAccessGridEl = document.getElementById('fast-access-grid');
const googleMegaBtnEl = document.getElementById('google-mega-btn');
const googleMegaMenuEl = document.getElementById('google-mega-menu');
const closeMenuBtnEl = document.getElementById('close-menu-btn');
const googleMenuGridEl = document.getElementById('google-menu-grid');
const menuActiveProfileEl = document.getElementById('menu-active-profile');
const toastContainerEl = document.getElementById('toast-container');

// INIT
function init() {
    renderUI();
    setupEventListeners();
}

function getActiveProfile() {
    return HUB_CONFIG.profiles.find((p) => p.id === activeProfileId) || HUB_CONFIG.profiles[0];
}

function renderUI() {
    const profile = getActiveProfile();

    // Apply Theme
    if (profile.id === 'g2') {
        document.body.classList.add('theme-red');
    } else {
        document.body.classList.remove('theme-red');
    }

    // Top Bar Text
    profileLabelEl.textContent = `פעיל: ${profile.label}`;
    menuActiveProfileEl.textContent = `פעיל: ${profile.label}`;

    // HERO SECTION LOGIC
    heroSectionEl.innerHTML = '';
    
    // Account 1: GPT Button
    if (profile.id === 'g1' && profile.heroButton) {
        heroSectionEl.classList.remove('hidden');
        renderGptButton(profile.heroButton);
    } 
    // Account 2: Classroom & Moodle Buttons
    else if (profile.id === 'g2') {
        heroSectionEl.classList.remove('hidden');
        
        // Classroom
        if (profile.classroomHero) {
            // Icon: Chalkboard
            const classroomPath = "M5 4v3h13V4H5zm-2 5h17v10H3V9zm4 2h9v2H7v-2z"; 
            renderDropdownButton(profile.classroomHero, 'classroom-hero-btn', classroomPath);
        }
        
        // Moodle
        if (profile.moodleHero) {
            // Icon: Mortarboard
            const moodlePath = "M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z";
            renderDropdownButton(profile.moodleHero, 'moodle-hero-btn', moodlePath);
        }
    } 
    else {
        heroSectionEl.classList.add('hidden');
    }

    // Fast Access Buttons
    fastAccessGridEl.innerHTML = '';
    profile.fastAccessLinks.forEach((link) => {
        const btn = document.createElement('a');
        btn.className = 'fast-btn';
        btn.href = link.url;
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.innerHTML = `
            <span class="btn-icon">${link.icon}</span>
            <span>${link.title}</span>
        `;
        btn.addEventListener('click', (e) => {
            showToast(`🚀 פותח את ${link.title}...`, 'info');
        });
        fastAccessGridEl.appendChild(btn);
    });

    // Google Menu Items
    googleMenuGridEl.innerHTML = '';
    profile.googleMenuLinks.forEach((link) => {
        const btn = document.createElement('a');
        btn.className = 'menu-item-btn';
        btn.href = link.url;
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.innerHTML = `
            <span class="btn-icon" style="font-size: 1.5rem;">${link.icon}</span>
            <span>${link.title}</span>
        `;
        googleMenuGridEl.appendChild(btn);
    });
}

// Helper: Render GPT Button
function renderGptButton(hero) {
    const btn = document.createElement('a');
    btn.className = 'gpt-hero-btn hero-btn';
    btn.href = hero.url;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';

    const gptSvg = `
        <svg class="gpt-logo-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.2819 9.82116C22.1929 9.38085 22.0163 8.95674 21.7589 8.57147C21.4925 8.1691 21.1437 7.82823 20.7388 7.57551C20.334 7.3228 19.8837 7.16487 19.4231 7.11306C19.2949 6.22013 18.9189 5.37854 18.3364 4.67972C17.7538 3.98091 16.9868 3.45095 16.1176 3.14652C15.2483 2.84209 14.3093 2.77457 13.3999 2.95115C12.4905 3.12773 11.6443 3.54181 10.9509 4.14925C10.8718 4.14081 10.7924 4.13658 10.7129 4.13658C9.524 4.13658 8.35821 4.49257 7.37113 5.15783C6.38405 5.8231 5.6219 6.76615 5.18529 7.86311C4.26908 8.0194 3.41113 8.43555 2.70955 9.06456C2.00798 9.69357 1.49071 10.5109 1.21631 11.4239C0.94191 12.3369 0.921319 13.3102 1.15689 14.2348C1.39247 15.1594 1.87498 16.0004 2.55018 16.6631C2.63919 17.1034 2.81577 17.5275 3.0732 17.9128C3.33958 18.3151 3.68839 18.656 4.09334 18.9087C4.49818 19.1614 4.94851 19.3194 5.40911 19.3712C5.53728 20.2641 5.91336 21.1057 6.49583 21.8045C7.0784 22.5033 7.84537 23.0333 8.71457 23.3377C9.58385 23.6422 10.5228 23.7097 11.4323 23.5331C12.3417 23.3565 13.1878 22.9424 13.8813 22.335C13.9604 22.3435 14.0398 22.3477 14.1193 22.3477C15.3082 22.3477 16.474 21.9917 17.4611 21.3264C18.4481 20.6612 19.2103 19.7181 19.6469 18.6211C20.5631 18.4648 21.4211 18.0487 22.1226 17.4197C22.8242 16.7907 23.3415 15.9733 23.6159 15.0603C23.8903 14.1473 23.9109 13.174 23.6753 12.2494C23.4397 11.3248 22.9572 10.4839 22.2819 9.82116ZM11.1399 21.7346C10.5098 21.8569 9.85906 21.8101 9.25666 21.5991C8.65426 21.3882 8.12282 21.0209 7.71916 20.5367C7.3155 20.0525 7.05494 19.4693 6.96614 18.8505L9.60833 20.3756C9.69348 20.4247 9.78917 20.4552 9.88785 20.4647C9.98654 20.4742 10.0856 20.4625 10.1773 20.4305C10.269 20.3985 10.3508 20.347 10.4164 20.2799C10.482 20.2128 10.5295 20.132 10.5552 20.0438L11.1399 21.7346ZM5.98925 17.6534C5.5566 17.6042 5.13214 17.4729 4.74972 17.2696C4.3673 17.0664 4.03741 16.7967 3.78563 16.4816C3.53396 16.1666 3.36709 15.8148 3.29803 15.454C3.22896 15.0931 3.25958 14.7331 3.3875 14.3942L6.02476 15.9169C6.09695 15.9585 6.17767 15.983 6.26058 15.9884C6.3435 15.9938 6.42634 15.9799 6.5026 15.9479C6.57885 15.9159 6.64645 15.8667 6.70008 15.8043C6.75371 15.7419 6.7919 15.668 6.81165 15.5884L5.94273 17.6534H5.98925ZM5.64573 10.58C5.52187 11.2016 5.56811 11.8441 5.7796 12.4411C5.9911 13.0381 6.36015 13.5678 6.84852 13.9754L5.80806 10.9669V10.9645C5.80806 10.8659 5.83296 10.7688 5.88062 10.6811C5.92828 10.5934 5.99732 10.5178 6.08201 10.4607C6.1667 10.4036 6.26462 10.3667 6.36764 10.353C6.47065 10.3394 6.57583 10.3496 6.67448 10.3828L5.64573 10.58ZM14.0772 3.82909C14.7073 3.70679 15.3581 3.75357 15.9605 3.96456C16.5629 4.17555 17.0943 4.54283 17.498 5.02703C17.9016 5.51123 18.1622 6.09443 18.251 6.71323L15.6088 5.18809C15.5236 5.13898 15.4279 5.10842 15.3292 5.09897C15.2306 5.08953 15.1315 5.10126 15.0398 5.13322C14.9481 5.16518 14.8663 5.21666 14.8007 5.2838C14.7351 5.35094 14.6876 5.43178 14.6619 5.51996L14.0772 3.82909ZM18.8475 7.91032C19.2801 7.95955 19.7046 8.0908 20.087 8.29402C20.4694 8.49725 20.7993 8.76697 21.0511 9.08204C21.3028 9.39711 21.4697 9.7489 21.5387 10.1097C21.6078 10.4705 21.5772 10.8305 21.4492 11.1695L18.812 9.64673C18.7398 9.60517 18.6591 9.58064 18.5762 9.57523C18.4932 9.56983 18.4104 9.58371 18.3341 9.61571C18.2579 9.64771 18.1903 9.69695 18.1367 9.75932C18.083 9.8217 18.0448 9.89556 18.0251 9.97517L18.8475 7.91032ZM22.0306 14.9837C22.1545 14.3621 22.1083 13.7196 21.8968 13.1226C21.6853 12.5256 21.3163 11.9959 20.8279 11.5882L21.8683 14.5968V14.5992C21.8683 14.6978 21.8434 14.7949 21.7958 14.8826C21.7481 14.9703 21.6791 15.0459 21.5944 15.1029C21.5097 15.16 21.4117 15.1969 21.3087 15.2106C21.2057 15.2243 21.1005 15.214 21.0019 15.1808L22.0306 14.9837ZM10.5529 14.8826C10.5052 14.9703 10.4362 15.0459 10.3515 15.1029C10.2668 15.16 10.1688 15.1969 10.0658 15.2106C9.96277 15.2243 9.8576 15.214 9.75895 15.1808L7.66833 14.5948C7.79468 15.2146 8.04753 15.7951 8.40698 16.2905C8.76644 16.786 9.22271 17.183 9.73977 17.4504L10.5529 14.8826ZM6.35515 12.5852C6.46731 12.0224 6.73295 11.4988 7.12604 11.066C7.51912 10.6332 8.02613 10.3061 8.59714 10.1168L10.4664 15.3456L8.43577 14.7766C8.35467 14.7538 8.27734 14.7171 8.20967 14.6689C8.14199 14.6208 8.08573 14.5625 8.04519 14.4986C8.00465 14.4346 7.98091 14.3666 7.97581 14.2997C7.97071 14.2329 7.98438 14.169 8.01579 14.1128L6.35515 12.5852ZM14.9427 19.3444C15.4293 19.183 15.8696 18.913 16.229 18.5557C16.5884 18.1983 16.8571 17.7631 17.0141 17.2838L12.0315 15.8893L12.8469 18.4639C12.8753 18.5534 12.9231 18.6343 12.9868 18.7001C13.0505 18.766 13.1284 18.8149 13.2146 18.8433C13.3007 18.8717 13.3927 18.8788 13.4834 18.864C13.5741 18.8492 13.6611 18.813 13.7375 18.7582L14.9427 19.3444ZM17.1839 12.9774C17.0718 13.5401 16.8061 14.0637 16.413 14.4965C16.02 14.9293 15.513 15.2564 14.942 15.4457L13.0727 10.2169L15.1033 10.7858C15.1844 10.8087 15.2618 10.8453 15.3294 10.8935C15.3971 10.9416 15.4534 10.9999 15.4939 11.0639C15.5345 11.1278 15.5582 11.1959 15.5633 11.2627C15.5684 11.3296 15.5547 11.3934 15.5233 11.4497L17.1839 12.9774ZM10.5907 8.35858L10.6071 8.36394L15.6136 9.76435L14.7981 7.1897C14.7698 7.10018 14.7219 7.01931 14.6582 6.95349C14.5946 6.88766 14.5167 6.83868 14.4305 6.81033C14.3443 6.78198 14.2524 6.77501 14.1617 6.78996C14.071 6.80491 13.9841 6.8413 13.9077 6.89613L12.6977 6.30799C12.2118 6.4687 11.7721 6.73788 11.4128 7.09439C11.0535 7.45091 10.7845 7.88514 10.6272 8.36394H10.5907V8.35858ZM12.7831 11.2016V14.3621L15.4239 12.8373L12.7831 11.3121V11.2016ZM11.4981 12.0536V11.9431L8.85732 13.4683L11.4981 14.9935V12.0536ZM12.1404 11.6499L13.993 12.7972L12.1404 13.8671V11.6499Z" fill="currentColor"/>
        </svg>`;

    btn.innerHTML = `
            ${gptSvg}
            <span class="gpt-label">${hero.title}</span>
        `;

    btn.addEventListener('click', () => {
      showToast(`🤖 פותח את ${hero.title}...`, 'info');
    });

    heroSectionEl.appendChild(btn);
  } else {
    heroSectionEl.classList.add('hidden');
  }

  // Fast Access Buttons
  // fastAccessGridEl.innerHTML = ''; // This is in the remaining part of renderUI

  // Fast Access Buttons
  fastAccessGridEl.innerHTML = '';
  profile.fastAccessLinks.forEach((link) => {
    const btn = document.createElement('a');
    btn.className = 'fast-btn';
    btn.href = link.url;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.innerHTML = `
            <span class="btn-icon">${link.icon}</span>
            <span>${link.title}</span>
        `;
    btn.addEventListener('click', (e) => {
      showToast(`🚀 פותח את ${link.title}... וודא שאתה מחובר`, 'info');
    });
    fastAccessGridEl.appendChild(btn);
  });

  // Google Menu Items
  googleMenuGridEl.innerHTML = '';
  profile.googleMenuLinks.forEach((link) => {
    const btn = document.createElement('a');
    btn.className = 'menu-item-btn';
    btn.href = link.url;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.innerHTML = `
            <span class="btn-icon" style="font-size: 1.5rem;">${link.icon}</span>
            <span>${link.title}</span>
        `;
    googleMenuGridEl.appendChild(btn);
  });
}

function setupEventListeners() {
  // Main Account Switch Button (Left Side)
  mainSwitchBtnEl.addEventListener('click', () => {
    toggleProfile();
  });

  // Google Mega Menu Toggle
  googleMegaBtnEl.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close Menu Button
  closeMenuBtnEl.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent bubbling to document
    closeMenu();
  });

  // Click Outside to Close
  document.addEventListener('click', (e) => {
    if (!googleMegaMenuEl.contains(e.target) && !googleMegaBtnEl.contains(e.target)) {
      closeMenu();
    }
  });

  // ESC to Close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });
}

function toggleProfile() {
  activeProfileId = activeProfileId === 'g1' ? 'g2' : 'g1';
  localStorage.setItem('activeProfileId', activeProfileId);
  renderUI();

  // Toast
  const profile = getActiveProfile();
  showToast(`🔄 הוחלף ל: ${profile.label}`, 'success');
}

function toggleMenu() {
  const isHidden = googleMegaMenuEl.classList.contains('hidden');
  if (isHidden) {
    googleMegaMenuEl.classList.remove('hidden');
  } else {
    googleMegaMenuEl.classList.add('hidden');
  }
}

function closeMenu() {
  googleMegaMenuEl.classList.add('hidden');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;

  toastContainerEl.appendChild(toast);

  // Auto remove after 3s (controlled by CSS animation duration mostly)
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Run
document.addEventListener('DOMContentLoaded', init);
