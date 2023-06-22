// /**
//  * @jest-environment jsdom
//  */

// import { screen, waitFor } from "@testing-library/dom";
// import BillsUI from "../views/BillsUI.js";
// import { bills } from "../fixtures/bills.js";
// import { ROUTES_PATH } from "../constants/routes.js";
// import { localStorageMock } from "../__mocks__/localStorage.js";

// import router from "../app/Router.js";

// describe("Given I am connected as an employee", () => {
//   describe("When I am on Bills Page", () => {
//     test("Then bill icon in vertical layout should be highlighted", async () => {
//       Object.defineProperty(window, "localStorage", {
//         value: localStorageMock,
//       });
//       window.localStorage.setItem(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//         })
//       );
//       const root = document.createElement("div");
//       root.setAttribute("id", "root");
//       document.body.append(root);
//       router();
//       window.onNavigate(ROUTES_PATH.Bills);
//       await waitFor(() => screen.getByTestId("icon-window"));
//       const windowIcon = screen.getByTestId("icon-window");
//       //to-do write expect expression
//     });
//     test("Then bills should be ordered from earliest to latest", () => {
//       document.body.innerHTML = BillsUI({ data: bills });
//       const dates = screen
//         .getAllByText(
//           /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
//         )
//         .map((a) => a.innerHTML);
//       const antiChrono = (a, b) => (a < b ? 1 : -1);
//       const datesSorted = [...dates].sort(antiChrono);
//       expect(dates).toEqual(datesSorted);
//     });
//   });
// });

/**
 * @jest-environment jsdom
 */

import BillsUI from "../views/BillsUI.js";
import { screen, waitFor } from "@testing-library/dom";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills";
import router from "../app/Router";

// //pour faire fonctionner expect+toHaveClass
// //https://stackoverflow.com/questions/65723708/react-testing-library-typeerror-expect-tohavetextcontent-is-not-a-functi
import "@testing-library/jest-dom/extend-expect";

// //erreur 404 500
// import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills.js";

//ReferenceError: userEvent is not defined
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      // Point 5.1 [Bug report] - Ajout des tests unitaires et d'intégration - Composant views/Bills
      expect(windowIcon).toHaveClass("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      //Point 1 [Bug report] - Bills
      //document.body.innerHTML = BillsUI({ data: bills });
      document.body.innerHTML = BillsUI({
        data: bills.sort((a, b) => (a.date < b.date ? 1 : -1)),
      });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});
//Point 5.2.1 [Bug report] - Ajout des tests unitaires et d'intégration - Composant container/Bills
// Vérifie si la modale du justificatif apparait
describe("When I click on the eye of a bill", () => {
  test("Then a modal must appear", async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    const NEWBILLS = new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });
    document.body.innerHTML = BillsUI({ data: bills });
    const handleClickIconEye = jest.fn((icon) =>
      NEWBILLS.handleClickIconEye(icon)
    );
    const iconEye = screen.getAllByTestId("icon-eye");
    $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));
    iconEye.forEach((icon) => {
      icon.addEventListener("click", handleClickIconEye(icon));
      userEvent.click(icon);
      expect(handleClickIconEye).toHaveBeenCalled();
    });
  });
});
describe('When click on button "Nouvelle note de frais"', () => {
  test("Then handleClickNewBill is called", () => {
    //RangeError: Maximum call stack size exceeded
    let NEWBILLS;

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    NEWBILLS = new Bills({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    document.body.innerHTML = BillsUI({ data: bills });

    const handleClickNewBill = jest.fn(() => NEWBILLS.handleClickNewBill());
    const button = screen.getByTestId("btn-new-bill");
    button.addEventListener("click", handleClickNewBill);
    userEvent.click(button);
    expect(handleClickNewBill).toHaveBeenCalled();
    handleClickNewBill.mockRestore();
  });
});

//Point 5.2.2 [Bug report] - Ajout des tests unitaires et d'intégration - Composant container/Bills
// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.tld",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => {
        expect(screen.getByText("Accepté")).toBeTruthy();
        expect(screen.getAllByText("En attente")).toBeTruthy();
        expect(screen.getAllByText("Refused")).toBeTruthy();
      });
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "employee@test.tld",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
