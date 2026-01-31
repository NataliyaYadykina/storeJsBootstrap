let tables = document.querySelectorAll("table");

tables.forEach((table) => {
  table.onclick = function (e) {
    if (e.target.tagName !== "TH") {
      return;
    }
    let th = e.target;
    let colNum = th.cellIndex;
    let type = th.getAttribute("data-type");
    let table = th.closest("table");
    sortTable(colNum, type, table.id);
  };
});

function sortTable(colNum, type, id) {
  let elem = document.getElementById(id);
  let tbody = elem.querySelector("tbody");
  let rowsArray = Array.from(tbody.rows);

  let compare;
  switch (type) {
    case "number":
      compare = function (rowA, rowB) {
        return rowA.cells[colNum].innerHTML - rowB.cells[colNum].innerHTML;
      };
      break;
    case "string":
      compare = function (rowA, rowB) {
        return rowA.cells[colNum].innerHTML.localeCompare(
          rowB.cells[colNum].innerHTML,
        );
      };
      break;
  }
  rowsArray.sort(compare);
  tbody.innerHTML = "";
  rowsArray.forEach((row) => tbody.appendChild(row));
}

if (!localStorage.getItem("goods")) {
  localStorage.setItem("goods", JSON.stringify([]));
}

let myModal = new bootstrap.Modal(document.getElementById("exampleModal"), {
  keyboard: false,
});

let options = {
  valueNames: ["name", "price"],
};

let userList;

document
  .querySelector("button.add_new")
  .addEventListener("click", function (e) {
    let name = document.getElementById("good_name").value;
    let price = parseFloat(document.getElementById("good_price").value);
    let quantity = parseInt(document.getElementById("good_quantity").value);
    if (name && price && quantity) {
      document.getElementById("good_name").value = "";
      document.getElementById("good_price").value = "";
      document.getElementById("good_quantity").value = "1";
      let goods = JSON.parse(localStorage.getItem("goods"));
      goods.push({
        id: "good_" + Date.now(),
        name: name,
        price: price,
        quantity: quantity,
        order_quantity: 0,
        discount: 0,
        amount: 0,
      });
      localStorage.setItem("goods", JSON.stringify(goods));
      update_goods();
      myModal.hide();
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid input",
        text: "Please fill in all fields with valid values.",
      });
    }
  });

update_goods();

function update_goods() {
  let result_price = 0;
  let tbody = document.querySelector(".list");
  tbody.innerHTML = "";
  document.querySelector(".cart").innerHTML = "";
  let goods = JSON.parse(localStorage.getItem("goods"));
  if (goods.length) {
    table1.hidden = false;
    table2.hidden = false;
    for (let i = 0; i < goods.length; i++) {
      tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr class="align-middle">
            <td>${i + 1}</td>
            <td class="name">${goods[i].name}</td>
            <td class="price">${goods[i].price.toFixed(2)}</td>
            <td>${goods[i].quantity}</td>
            <td><button class="btn btn-danger good_delete" data-delete="${goods[i].id}">&#10006;</button></td>
            <td><button class="btn btn-primary good_add" data-goods="${goods[i].id}">&#10149;</button></td>
        </tr>`,
      );
      if (goods[i].order_quantity > 0) {
        let amount =
          goods[i].price *
          goods[i].order_quantity *
          (1 - goods[i].discount / 100);
        result_price += amount;
        document.querySelector(".cart").insertAdjacentHTML(
          "beforeend",
          `
          <tr class="align-middle">
            <td>${i + 1}</td>
            <td class="name">${goods[i].name}</td>
            <td class="price">${goods[i].price.toFixed(2)}</td>
            <td>${goods[i].order_quantity}</td>
            <td class="discount"><input data-goodid="${goods[i].id}" type="text" min="0" max="100" value="${goods[i].discount}"></td>
            <td class="amount">${amount.toFixed(2)}</td>
            <td><button class="btn btn-danger good_delete" data-delete="${goods[i].id}">&#10006;</button></td>
          </tr>`,
        );
      }
    }
    userList = new List("goods", options);
  } else {
    table1.hidden = true;
    table2.hidden = true;
  }
  document.querySelector(".price_result").innerHTML = result_price.toFixed(2);
}

document.querySelector(".list").addEventListener("click", function (e) {
  if (!e.target.dataset.delete) {
    return;
  }
  Swal.fire({
    title: "Warning!",
    text: "Do you really want to delete the Good?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      let goods = JSON.parse(localStorage.getItem("goods"));
      goods = goods.filter((item) => item.id !== e.target.dataset.delete);
      localStorage.setItem("goods", JSON.stringify(goods));
      update_goods();
      Swal.fire("Deleted!", "The Good has been deleted.", "success");
    }
  });
});

document.querySelector(".list").addEventListener("click", function (e) {
  if (!e.target.dataset.goods) {
    return;
  }
  let goods = JSON.parse(localStorage.getItem("goods"));
  for (let i = 0; i < goods.length; i++) {
    if (goods[i].id === e.target.dataset.goods && goods[i].quantity > 0) {
      goods[i].quantity -= 1;
      goods[i].order_quantity += 1;
      localStorage.setItem("goods", JSON.stringify(goods));
      update_goods();
      return;
    }
  }
});

document.querySelector(".cart").addEventListener("click", function (e) {
  if (!e.target.dataset.delete) {
    return;
  }
  let goods = JSON.parse(localStorage.getItem("goods"));
  for (let i = 0; i < goods.length; i++) {
    if (
      goods[i].id === e.target.dataset.delete &&
      goods[i].order_quantity > 0
    ) {
      goods[i].quantity += 1;
      goods[i].order_quantity -= 1;
      localStorage.setItem("goods", JSON.stringify(goods));
      update_goods();
      return;
    }
  }
});

document.querySelector(".cart").addEventListener("input", function (e) {
  if (!e.target.dataset.goodid) {
    return;
  }
  let goods = JSON.parse(localStorage.getItem("goods"));
  for (let i = 0; i < goods.length; i++) {
    if (goods[i].id === e.target.dataset.goodid) {
      let discount = parseFloat(e.target.value);
      if (isNaN(discount) || discount < 0) {
        discount = 0;
      }
      if (discount > 100) {
        discount = 100;
      }
      goods[i].discount = discount;
      localStorage.setItem("goods", JSON.stringify(goods));
      update_goods();
      let input = document.querySelector(`input[data-goodid="${goods[i].id}"]`);
      input.focus();
      input.selectionStart = input.value.length;
      return;
    }
  }
});
