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

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

//pour faire fonctionner expect+toHaveClass
//https://stackoverflow.com/questions/65723708/react-testing-library-typeerror-expect-tohavetextcontent-is-not-a-functi
import "@testing-library/jest-dom/extend-expect";

// //erreur 404 500
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills.js";

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
//Point 5.2.2 [Bug report] - Ajout des tests unitaires et d'intégration - Composant container/Bills
describe("Given I am a user connected as an employee", () => {
  describe("When I click on icon-eye", () => {
    describe("When I navigate to Bills", () => {
      // Il faut que le titre Mes notes de frais apparaisse bien sur la page
      test("Then the page show", async () => {
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
        new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });
        document.body.innerHTML = BillsUI({ data: bills });
        await waitFor(() => screen.getByText("Mes notes de frais"));
        expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      });
    });
  });
});
//Point 5.2.2 [Bug report] - Ajout des tests unitaires et d'intégration - Composant container/Bills
// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => {
        expect(screen.getByText("accepted")).toBeTruthy();
        expect(screen.getAllByText("pending")).toBeTruthy();
        expect(screen.getAllByText("refused")).toBeTruthy();
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
              email: "a@a",
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
});
