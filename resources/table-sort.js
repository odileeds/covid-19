/* 
table-sort-js
Author: Lee Wannacott
Licence: MIT License Copyright (c) 2021 Lee Wannacott 
Modified by Stuart Lowe 28th January 2021
    
GitHub Repository: https://github.com/LeeWannacott/table-sort-js
npm package: https://www.npmjs.com/package/table-sort-js
Demo: https://leewannacott.github.io/Portfolio/#/GitHub

Install:
Frontend: <script src="https://leewannacott.github.io/table-sort-js/table-sort.js"></script> or
Download this file and add <script src="table-sort.js"></script> to your HTML 

Backend: npm install table-sort-js and use require("../node_modules/table-sort-js/table-sort.js") 

Instructions:
  Add class="table-sort" to tables you'd like to make sortable
  Click on the table headers to sort them.
*/

function tableSortJs() {
    const columnData = [];
    const dictOfColumnIndexAndTableRow = {};
    for (let sortableTable of document.getElementsByTagName("table")) {
        if (sortableTable.classList.contains("table-sort")) {
            if (sortableTable.getElementsByTagName("thead").length === 0) {
                const the = document.createElement("thead");
                the.appendChild(sortableTable.rows[0]);
                sortableTable.insertBefore(the, sortableTable.firstChild);
            }

            const tableHead = sortableTable.querySelector("thead");
            const tableBody = sortableTable.querySelector("tbody");
            const tableHeadHeaders = tableHead.querySelectorAll("th");


            // Display a mouse pointer on hover over table headers.
            tableHead.addEventListener("mouseover", function (event) {
                setCursor(tableHead, "pointer");
            });
            function setCursor(tag, cursorStyle) {
                var elem;
                if (sortableTable.getElementsByTagName && (elem = tag)) {
                    if (elem.style) {
                        elem.style.cursor = cursorStyle;
                    }
                }
            }

            for (let [columnIndex, th] of tableHeadHeaders.entries("table")) {
                let timesClickedColumn = 0;

                th.addEventListener("click", function (e) {
                    timesClickedColumn += 1;

					s = tableHead.querySelector('.sorted');
					if(s){
						s.classList.remove('sorted');
						s.classList.remove('sorted-dn');
						s.classList.remove('sorted-up');
					}
					e.target.classList.add(timesClickedColumn%2==0 ? 'sorted-up' : 'sorted-dn');
					e.target.classList.add('sorted');

                    function getTableDataOnClick() {
                        const tableRows = tableBody.querySelectorAll("tr");
                        for (let [i, tr] of tableRows.entries()) {
                            if (
                                tr.querySelectorAll("td").item(columnIndex)
                                    .innerHTML !== ""
                            ) {
                                columnData.push(
                                    tr.querySelectorAll("td").item(columnIndex)
                                        .innerHTML +
                                        "#" +
                                        i
                                );
                                dictOfColumnIndexAndTableRow[
                                    tr.querySelectorAll("td").item(columnIndex)
                                        .innerHTML +
                                        "#" +
                                        i
                                ] = tr.innerHTML;
                            } else {
                                // Fill in blank table cells with a value(0)
                                columnData.push("0#" + i);
                                dictOfColumnIndexAndTableRow["0#" + i] =
                                    tr.innerHTML;
                            }
                        }
                        function naturalSortAescending(a, b) {
                            return a.localeCompare(
                                b,
                                navigator.languages[0] || navigator.language,
                                { numeric: true, ignorePunctuation: true }
                            );
                        }
                        function naturalSortDescending(a, b) {
                            return naturalSortAescending(b, a);
                        }

                        // Sort naturally; default aescending unless th contains 'order-by-desc' as className.
                        if (typeof columnData[0] !== "undefined") {
                            if (
                                th.classList.contains("order-by-desc")  &&
                                timesClickedColumn === 1
                            ) {
                                columnData.sort(naturalSortDescending, {
                                    numeric: true,
                                    ignorePunctuation: true,
                                });
                            } else if (
                                th.classList.contains("order-by-desc")  &&
                                timesClickedColumn === 2
                            ) {
                                columnData.sort(naturalSortAescending, {
                                    numeric: true,
                                    ignorePunctuation: true,
                                });
                                timesClickedColumn = 0;
                            } else if (timesClickedColumn === 1) {
                                columnData.sort(naturalSortAescending);
                            } else if (timesClickedColumn === 2) {
                                columnData.sort(naturalSortDescending);
                                timesClickedColumn = 0;
                            }
                        }
                    }
                    getTableDataOnClick();
                    function returnSortedTable() {
                        const tableRows = tableBody.querySelectorAll("tr");
                        for (let [i, tr] of tableRows.entries()) {
                            tr.innerHTML =
                                dictOfColumnIndexAndTableRow[columnData[i]];
                        }
                        columnData.length = 0;
                    }
                    returnSortedTable();
                });
            }
        }
    }
}

if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
) {
    tableSortJs();
} else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tableSortJs, false);
}
