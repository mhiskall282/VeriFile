import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./page/Home";
import Auth from "./page/RegisterChoice";
import Organization from "./page/Organization";
import Employee from "./page/Employee";
import UploadDocuments from "./page/UploadDocuments";
import VerifyDocuments from "./page/VerifyDocuments";
import ProtectedRoute from "./utils/ProtectedRoute";
import RegisterChoice from "./page/RegisterChoice";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/register-choice",
      element: <RegisterChoice />,
    },
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          path: "organization",
          element: <Organization />,
        },
        {
          path: "employee",
          element: <Employee />,
        },
        {
          path: "upload",
          element: <UploadDocuments />,
        },
      ],
    },
    {
      path: "verify",
      element: <VerifyDocuments />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
