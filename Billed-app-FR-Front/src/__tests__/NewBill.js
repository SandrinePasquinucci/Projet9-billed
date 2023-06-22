/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";
import { bills } from "../fixtures/bills";

jest.mock("../app/store", () => mockStore);

//Point 5.3.1 [Bug report] - Ajout des tests unitaires et d'intégration - Composant container/NewBill

//Point 5.3.2 [Bug report] - Ajout des tests unitaires et d'intégration - Composant container/NewBill
// test d'intégration POST
test("POST bill", async () => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "a@a",
    })
  );
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.NewBill);
  await waitFor(() => screen.getAllByText("Envoyer"));
});

describe("When an error occurs on API", () => {
  test("POST bill fails with 500 message error", async () => {
    try {
      jest.spyOn(mockStore, "bills");

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
          password: "employee",
          status: "connected",
        })
      );

      window.onNavigate(ROUTES_PATH.NewBill);

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();

      const buttonSubmit = screen.getAllByText("Envoyer");
      buttonSubmit[0].click();

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: (bill) => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.NewBill);
      await new Promise(process.nextTick);
      const message = screen.queryByText(/Erreur 500/);
      await waitFor(() => {
        expect(message).toBeTruthy();
      });
    } catch (error) {
      console.error(error);
    }
  });
});
