let areaChecks = document.querySelectorAll('.area input');
let tableInfo = document.querySelector('.table');
let tbody = document.createElement('tbody');
tbody.className = 'tbody';
let html = '';
let areaBtnBox = document.querySelector('.btn-box');
let search = document.querySelector('.key-word #search');
let dataTotal = 0;
let pagination = document.querySelector('.pagination');
let initialValueBtn = 1;
let changePage = {
    prev: "<button class='button button-prev'>上一頁</button>",
    next: "<button class='button button-next'>下一頁</button>"
}
let pageTotal = 0;
let groupData = [];
let result = {
    currentPageNumber: 0,
    totalNumber: 0,
    currentPageBtn: 0
}



fetch("https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json")
    .then(function (res) {

        return res.json();

    })
    .then(function (result) {

        initialArea(result); // 初始化地區 
        areaBtnFilter(result); // 地區全部顯示或取消顯示
        areasCheck(result); //個別選擇地區  
        userSearch(result); // 搜尋區域

    })
    .catch(function () {
        console.log('error');
    })


// 初始化地區 
function initialArea(areaData) {

    areaChecks.forEach((areaCheck) => {
        areaCheck.checked = true;
    });


    if (search.value === '') {

        //渲然html
        renderPanel(areaData);
    }

    if (search.value !== '') {
        checkChange(areaData, search.value);
    }

}

//渲然html
function renderPanel(areaData) {

    html = '';

    areaData.forEach((item) => {
        html +=
            `<tr>
                <td>${item.sarea}</td>
                <td>${item.sna.slice(item.sna.indexOf('_') + 1)}</td>
                <td>${item.sbi}</td>
                <td>${item.bemp}</td>
            </tr>`;
    })

    tbody.innerHTML = html;
    tableInfo.appendChild(tbody);

    pageData();
}


// 選擇區域
function checkChange(areaData, areaName) {

    let excludeArr = exclude();

    searchFilter(areaName, areaNameNewData(excludeArr, areaData));

}


// 挑出要刪除的區域名稱
function exclude() {

    let excludeArr = [];

    areaChecks.forEach((checkBox) => {
        if (checkBox.checked === false) {
            excludeArr.push(checkBox.nextSibling.textContent.trim());
        }
    })

    return excludeArr;

}

//要刪除的區域名稱與資料篩選
function areaNameNewData(excludeArr, areaData) {
    excludeArr.forEach((excludeAreaName) => {
        areaData = areaData.filter((item) => {
            return item.sarea !== excludeAreaName;
        })

    })

    return areaData;
}


// 搜尋和選擇區域的資料變動
function searchFilter(areaName, areaData) {

    areaData = areaData.filter((item) => {
        return item.sarea.includes(areaName) || item.sna.slice(item.sna.indexOf('_') + 1).includes(areaName);
    })

    renderPanel(areaData);

}


//地區全部顯示或取消顯示
function areaBtnFilter(areaData) {
    areaBtnBox.addEventListener('click', function (e) {


        if (e.target.classList.contains('cancel-all')) {
            // 清除所有地區
            clearAll();
        }

        if (e.target.classList.contains('choose-all')) {
            //全選地區
            initialArea(areaData);
        }

    })
}

// 清除所有地區
function clearAll() {

    if (document.querySelector('.tbody') !== null) {
        areaChecks.forEach((areaCheck) => {
            areaCheck.checked = false;
        });

        tableInfo.removeChild(tbody);

        pageData();
    }
}

//個別選擇地區 
function areasCheck(areaData) {
    areaChecks.forEach((checkBox) => {
        checkBox.addEventListener('click', function () {
            checkChange(areaData, search.value);
        })
    })
}


//搜尋區域
function userSearch(areaData) {

    search.addEventListener('keydown', function (e) {
        if (e.code === 'NumpadEnter' || e.code === 'Enter') {
            e.preventDefault();
        }

    })

    search.addEventListener('keyup', function (e) {
        searchFilter(e.target.value, areaNameNewData(exclude(), areaData));
    })

}


//頁面按鈕資料
function pageData() {
    let perPageData = 10;
    dataTotal = document.querySelectorAll('.table tbody tr');


    pageTotal = dataTotal.length > 0 ? Math.ceil(dataTotal.length / perPageData) : 0;

    initialValueBtn = (pageTotal === 0 ? 0 : 1);


    pagination.removeEventListener('click', changePageBtn);
    pagination.removeEventListener('click', singlePageBtn);

    if (pageTotal >= 8) {
        pagination.addEventListener('click', changePageBtn);
        createPagination(); // 產生頁面按鈕
    }


    if (pageTotal === 0) {
        pagination.innerHTML = '';
        groupData = [];
        sortCount();
    }


    if (pageTotal < 8 && pageTotal !== 0) {
        pagination.addEventListener('click', singlePageBtn);
        currentBtnHtml = '';
        for (let pageLength = initialValueBtn; pageLength <= pageTotal; pageLength++) {

            if (pageLength === initialValueBtn) {
                active = 'active';
            } else {
                active = '';
            }

            currentBtnHtml += `<button class='button button-number ${active}'>${pageLength}</button>`;
        }

        pagination.innerHTML = changePage.prev + currentBtnHtml + changePage.next;
    }

    sliceDataTotal(dataTotal); // 每顆按鈕切割10筆資料


}

// 多頁按鈕的處理
function changePageBtn(e) {

    if (e.target.classList.contains('button-prev')) {
        initialValueBtn = initialValueBtn - 1 <= 0 ? initialValueBtn = 1 : initialValueBtn - 1;
        createPagination();
        addActive();
    }

    if (e.target.classList.contains('button-next')) {

        if (initialValueBtn < pageTotal) {
            initialValueBtn++;
            createPagination();
            addActive();
        }

    }

    if (e.target.classList.contains('button-number')) {
        initialValueBtn = Number(e.target.textContent);
        createPagination();
        addActive();
    }


}

// 單頁按鈕的處理
function singlePageBtn(e) {

    if (e.target.classList.contains('button-prev')) {
        initialValueBtn = initialValueBtn - 1 <= 0 ? initialValueBtn = 1 : initialValueBtn - 1;

        if (initialValueBtn <= pageTotal) {
            addActive();
        }

    }

    if (e.target.classList.contains('button-next')) {


        if (initialValueBtn < pageTotal) {
            initialValueBtn++;

            if (initialValueBtn <= pageTotal) {
                addActive();
            }
        }

    }

    if (e.target.classList.contains('button-number')) {
        initialValueBtn = Number(e.target.textContent);
        addActive();
    }


}

// 產生頁面按鈕
function createPagination() {
    let active = '';

    currentBtnHtml = '';

    if (initialValueBtn + 7 <= pageTotal) {

        currentBtnHtml += `${changePage.prev}`;

        for (let pageLength = initialValueBtn; pageLength <= initialValueBtn + 7; pageLength++) {

            if (pageLength === initialValueBtn) {
                active = 'active';
            } else {
                active = '';
            }

            currentBtnHtml += `<button class='button button-number ${active}'>${pageLength}</button>`;
        }
        pagination.innerHTML = currentBtnHtml + changePage.next;

    }


    if (initialValueBtn + 7 > pageTotal) {
        currentBtnHtml += `${changePage.prev}`;

        for (let pageLength = pageTotal - 7; pageLength <= pageTotal; pageLength++) {
            currentBtnHtml += `<button class='button button-number'>${pageLength}</button>`;
        }
        pagination.innerHTML = currentBtnHtml + changePage.next;

    }

}

//首顆按鈕套顏色
function addActive() {

    let NewBtnTags = document.querySelectorAll('.pagination .button-number');

    NewBtnTags.forEach((tag) => {
        tag.classList.remove('active');
        if (Number(tag.textContent) === initialValueBtn) {
            tag.classList.add('active');
        }
    })

    showCurrentPageData();

}

// 每顆按鈕切割10筆資料
function sliceDataTotal(dataTotal) {

    groupData = [];

    for (let i = 0; i < dataTotal.length; i += 10) {
        groupData.push(Array.from(dataTotal).slice(i, i + 10));
    }


    // 顯示當前按鈕的資料
    showCurrentPageData();

}

// 顯示當前按鈕的資料
function showCurrentPageData() {
    let pageBtn = Array.from(document.querySelectorAll('.pagination .button-number'));
    html = '';

    pageBtn.forEach(function (btn) {

        if (btn.classList.contains('active')) {

            groupData[initialValueBtn - 1].forEach(function (item) {
                html += `<tr>
                    <td>${item.querySelectorAll('td')[0].textContent}</td>
                    <td>${item.querySelectorAll('td')[1].textContent}</td>
                    <td>${item.querySelectorAll('td')[2].textContent}</td>
                    <td>${item.querySelectorAll('td')[3].textContent}</td>
                </tr>`;
            })

            sortCount();
        };

    })

    tbody.innerHTML = html;
    tableInfo.appendChild(tbody);

}

// 計算頁面筆數
function sortCount() {
    let count = document.querySelector('.sort-count');
    let countHtml = '';


    result.currentPageNumber = groupData.length === 0 ? 0 : groupData[initialValueBtn - 1].length;
    result.totalNumber = dataTotal === 0 ? 0 : dataTotal.length;
    result.currentPageBtn = initialValueBtn;


    countHtml += `<span>此頁${result.currentPageNumber}筆</span> 
                  <span>共有${result.totalNumber}筆</span>
                  <span>${result.currentPageBtn}/${pageTotal}頁</span>`
    count.innerHTML = countHtml;


}