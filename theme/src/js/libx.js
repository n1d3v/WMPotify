'use strict';

let categoryButtons;
const categoryButtonsHierarchy = [];
const categoryLocalizations = {};
const categoryButtonsObserver = new MutationObserver(parseCategoryButtons);
const folderObserver = new MutationObserver(() => {
    categoryButtonsObserver.disconnect();
    categoryButtons = document.querySelector('.main-yourLibraryX-filterArea .search-searchCategory-categoryGrid [role="presentation"]');
    parseCategoryButtons();
    categoryButtonsObserver.observe(categoryButtons, { childList: true });
});
let inFolder = false;
let lastCategories = [];

const CustomLibX = {
    async init() {
        if (document.querySelector('#wmpotify-libx-sidebar')) {
            return;
        }

        const filterKeys = Object.keys(Spicetify.Platform.Translations).filter(key => key.startsWith('shared.library.filter.'));
        filterKeys.forEach(key => {
            const value = Spicetify.Platform.Translations[key];
            categoryLocalizations[key.split('.').pop()] = {
                'loc_id': key,
                'value': value
            };
        });

        if (categoryButtonsHierarchy.length === 0) {
            categoryButtonsHierarchy.push({
                identifier: 'playlist',
                localized: categoryLocalizations.playlist.value,
                elem: null
            });
            categoryButtonsHierarchy.push({
                identifier: 'album',
                localized: categoryLocalizations.album.value,
                elem: null
            });
            categoryButtonsHierarchy.push({
                identifier: 'artist',
                localized: categoryLocalizations.artist.value,
                elem: null
            });
        }

        const header = document.createElement('div');
        header.id = 'wmpotify-libx-header';
        document.querySelector('.main-yourLibraryX-libraryContainer').insertAdjacentElement('afterbegin', header);

        const sidebar = document.createElement('div');
        sidebar.id = 'wmpotify-libx-sidebar';
        document.querySelector('.main-yourLibraryX-libraryItemContainer').insertAdjacentElement('afterbegin', sidebar);

        await waitForLibXLoad();

        categoryButtons = document.querySelector('.main-yourLibraryX-filterArea .search-searchCategory-categoryGrid [role="presentation"]');
        parseCategoryButtons();
        categoryButtonsObserver.observe(categoryButtons, { childList: true });

        // Whole category buttons container gets re-rendered when entering and exiting a playlist folder
        folderObserver.observe(document.querySelector('.main-yourLibraryX-filterArea'), { childList: true });
    },

    uninit() {
        document.querySelector('#wmpotify-libx-header')?.remove();
        document.querySelector('#wmpotify-libx-sidebar')?.remove();
        categoryButtonsObserver.disconnect();
        folderObserver.disconnect();
    },
};

function renderHeader() {
    const header = document.querySelector('#wmpotify-libx-header');
    header.innerHTML = '';
    const rootIcon = document.createElement('div');
    rootIcon.classList.add('wmpotify-libx-header-root-icon');
    rootIcon.classList.add('wmpotify-toolbar-button');
    header.appendChild(rootIcon);
    const rootText = document.createElement('button');
    rootText.classList.add('wmpotify-libx-header-root-text');
    rootText.classList.add('wmpotify-toolbar-button');
    rootText.textContent = 'Music';
    rootText.addEventListener('click', goToRootCategory);
    header.appendChild(rootText);

    const currentCategories = getCurrentCategories();
    currentCategories.forEach((category, index) => {
        const categoryText = document.createElement('button');
        categoryText.classList.add('wmpotify-libx-header-category-text');
        categoryText.classList.add('wmpotify-toolbar-button');
        categoryText.textContent = category;
        categoryText.addEventListener('click', async () => {
            if (!categoryText.nextElementSibling) {
                return;
            }
            if (inFolder) {
                exitFolder();
                await waitForFolderChange();
            }
            categoryButtonsObserver.disconnect();
            const currentCategory = categoryButtonsHierarchy.find(cat => cat.localized === category);
            if (index === 0) {
                goToRootCategory();
                await waitForCategoryButtonsUpdate();
            } else {
                const parentCategory = categoryButtonsHierarchy.find(cat => cat.localized === currentCategories[index - 1]);

                if (!isInParentCategory(parentCategory) || !document.contains(currentCategory.elem)) {
                    if (!isInRootCategory()) {
                        goToRootCategory();
                        await waitForCategoryButtonsUpdate();
                    }
                    parentCategory.elem.click();
                    await waitForCategoryButtonsUpdate();
                }
            }
            refreshElement(currentCategory);
            currentCategory.elem.click();
            categoryButtonsObserver.observe(categoryButtons, { childList: true });
        });
        header.appendChild(categoryText);
    });

    if (inFolder) {
        const folderName = document.querySelector('.main-yourLibraryX-collapseButton > div').textContent;
        const folderText = document.createElement('button');
        folderText.classList.add('wmpotify-libx-header-category-text');
        folderText.classList.add('wmpotify-toolbar-button');
        folderText.textContent = folderName;
        header.appendChild(folderText);
    }
}

function parseCategoryButtons() {
    inFolder = document.querySelector('.main-yourLibraryX-collapseButton').childElementCount > 1;
    if (inFolder) {
        // In a playlist folder, etc. Not the real root category
        renderHeader();
        return;
    }
    const isInitial = !categoryButtons.querySelector('button[class*="ChipClear"]:first-child');
    const buttons = Array.from(categoryButtons.querySelectorAll('button'));
    if (isInitial) {
        buttons.forEach((button, index) => {
            const category = {};
            category.localized = button.textContent;
            category.identifier = Object.keys(categoryLocalizations).find(key => categoryLocalizations[key].value === category.localized);
            category.elem = button;
            if (!categoryButtonsHierarchy.some(cat => cat.localized === category.localized)) {
                categoryButtonsHierarchy.push(category);
            }
        });
    } else {
        buttons.shift(); // Skip the category clear button
        const currentParentLocalized = buttons[0].textContent;
        let currentParent = categoryButtonsHierarchy.find(category => category.localized === currentParentLocalized);
        if (!currentParent) {
            const category = {};
            category.localized = currentParentLocalized;
            category.identifier = Object.keys(categoryLocalizations).find(key => categoryLocalizations[key].value === category.localized);
            category.elem = buttons[0];
            categoryButtonsHierarchy.push(category);
            currentParent = category;
        }
        if (!currentParent.children) {
            currentParent.children = [];
        }
        buttons.shift(); // Skip the parent category button
        buttons.forEach((button, index) => {
            const category = {};
            category.localized = button.textContent;
            category.identifier = Object.keys(categoryLocalizations).find(key => categoryLocalizations[key].value === category.localized);
            category.elem = button;
            if (!currentParent.children.some(cat => cat.localized === category.localized)) {
                currentParent.children.push(category);
            }
        });
    }
    renderHeader();
    renderSidebar();
}

// Refresh the element reference in the category object
function refreshElement(category) {
    if (!document.contains(category.elem)) {
        for (const button of categoryButtons.querySelectorAll('button')) {
            if (button.textContent === category.localized) {
                category.elem = button;
                break;
            }
        }
    }
}

function isInRootCategory() {
    return !categoryButtons.querySelector('button[class*="ChipClear"]:first-child');
}

function isInParentCategory(parentCategory) {
    if (isInRootCategory()) {
        return false;
    }
    const buttons = Array.from(categoryButtons.querySelectorAll('button'));
    return buttons[1].textContent === parentCategory.localized;
}

async function goToRootCategory() {
    if (inFolder) {
        exitFolder();
        await waitForFolderChange();
    }
    categoryButtons.querySelector('button[class*="ChipClear"]:first-child')?.click();
};

function exitFolder() {
    document.querySelectorAll('.main-yourLibraryX-collapseButton button')?.[1]?.click();
}

function getCurrentCategories() {
    const currentCategories = [];
    inFolder = document.querySelector('.main-yourLibraryX-collapseButton').childElementCount > 1;
    if (inFolder) {
        return lastCategories;
    } else if (isInRootCategory()) {
        lastCategories = [];
        return currentCategories;
    } else {
        const buttons = Array.from(categoryButtons.querySelectorAll('button')).slice(1);
        let currentParent = buttons[0].textContent;
        currentCategories.push(currentParent);
        const activeChild = categoryButtons.querySelector('button[class*="secondary-selected"]');
        if (activeChild) {
            currentCategories.push(activeChild.textContent);
        }
        lastCategories = structuredClone(currentCategories);
    }
    return currentCategories;
}

function renderSidebar() {
    const sidebar = document.querySelector('#wmpotify-libx-sidebar');
    sidebar.innerHTML = '';
    const rootButtonContainer = document.createElement('div');
    rootButtonContainer.classList.add('wmpotify-libx-sidebar-item-container');
    const rootButton = document.createElement('button');
    rootButton.classList.add('wmpotify-libx-sidebar-item');
    rootButton.id = 'wmpotify-libx-sidebar-root';
    rootButton.textContent = 'Library';
    rootButton.addEventListener('click', goToRootCategory);
    const rootButtonChevron = document.createElement('div');
    rootButtonChevron.classList.add('wmpotify-libx-sidebar-chevron');
    rootButtonChevron.addEventListener('click', () => {
        sidebar.classList.toggle('rootCollapsed');
    });
    rootButtonContainer.appendChild(rootButtonChevron);
    rootButtonContainer.appendChild(rootButton);
    sidebar.appendChild(rootButtonContainer);
    categoryButtonsHierarchy.forEach(category => {
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('wmpotify-libx-sidebar-item-container');
        const button = document.createElement('button');
        button.classList.add('wmpotify-libx-sidebar-item');
        button.textContent = category.localized;
        button.dataset.identifier = category.identifier;
        button.addEventListener('click', async () => {
            if (button.classList.contains('active') && !inFolder) {
                return;
            }
            if (inFolder) {
                exitFolder();
                await waitForFolderChange();
            }
            categoryButtonsObserver.disconnect();
            if (!isInRootCategory()) {
                goToRootCategory();
                await waitForCategoryButtonsUpdate();
            }
            refreshElement(category);
            category.elem.click();
            categoryButtonsObserver.observe(categoryButtons, { childList: true });
        });
        buttonContainer.appendChild(button);
        sidebar.appendChild(buttonContainer);
        if (category.children && category.children.length > 0) {
            const buttonChevron = document.createElement('div');
            buttonChevron.classList.add('wmpotify-libx-sidebar-chevron');
            buttonChevron.addEventListener('click', () => {
                buttonContainer.classList.toggle('collapsed');
            });
            buttonContainer.insertBefore(buttonChevron, button);
            const downlevel = document.createElement('div');
            downlevel.classList.add('wmpotify-libx-sidebar-downlevel');
            category.children.forEach(child => {
                const childButton = document.createElement('button');
                childButton.classList.add('wmpotify-libx-sidebar-item');
                childButton.textContent = child.localized;
                childButton.dataset.identifier = child.identifier;
                childButton.addEventListener('click', async () => {
                    if (childButton.classList.contains('active') && !inFolder) {
                        return;
                    }
                    if (inFolder) {
                        exitFolder();
                        await waitForFolderChange();
                    }
                    categoryButtonsObserver.disconnect();
                    refreshElement(child);
                    if (!isInParentCategory(category) || !document.contains(child.elem)) {
                        if (!isInRootCategory()) {
                            goToRootCategory();
                            await waitForCategoryButtonsUpdate();
                        }
                        refreshElement(category);
                        category.elem.click();
                        await waitForCategoryButtonsUpdate();
                    }
                    refreshElement(child);
                    child.elem.click();
                    categoryButtonsObserver.observe(categoryButtons, { childList: true });
                });
                downlevel.appendChild(childButton);
            });
            sidebar.appendChild(downlevel);
        }
    });
    const activeCategories = getCurrentCategories();
    if (activeCategories.length > 0) {
        const activeCategory = activeCategories.pop();
        const activeButton = Array.from(sidebar.querySelectorAll('.wmpotify-libx-sidebar-item')).find(button => button.textContent === activeCategory);
        activeButton.classList.add('active');
    } else {
        rootButton.classList.add('active');
    }
}

function waitForLibXLoad() {
    if (!document.querySelector('.main-yourLibraryX-filterArea .search-searchCategory-categoryGrid [role="presentation"]')) {
        return new Promise((resolve) => {
            const observer = new MutationObserver(() => {
                if (document.querySelector('.main-yourLibraryX-filterArea .search-searchCategory-categoryGrid [role="presentation"]')) {
                    resolve();
                    observer.disconnect();
                }
            });
            observer.observe(document.querySelector('.main-yourLibraryX-libraryItemContainer'), { childList: true, subtree: true });
        });
    }
}

function waitForCategoryButtonsUpdate() {
    return new Promise((resolve) => {
        const observer = new MutationObserver(() => {
            if (categoryButtons.querySelector('button')) {
                resolve();
                observer.disconnect();
            }
        });
        observer.observe(categoryButtons, { childList: true });
    });
}

function waitForFolderChange() {
    return new Promise((resolve) => {
        const observer = new MutationObserver(() => {
            resolve();
            observer.disconnect();
        });
        observer.observe(document.querySelector('.main-yourLibraryX-filterArea'), { childList: true });
    });
}

export default CustomLibX;