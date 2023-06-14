import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import useContent from "../hooks/useContent";
import { Delete28Regular, Edit24Filled } from "@ricons/fluent";
import { Icon } from "@ricons/utils";
import ExcelJS from "exceljs";
import {
  Box,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  ModalFooter
} from "@chakra-ui/react";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  Pagination
} from "@windmill/react-ui";

import { FaCheckCircle, FaTimesCircle, FaEdit } from "react-icons/fa";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";

const TASK_URL = "/tasks";

const task_type = ["Production", "Non-Production"];
const sub_task_type = {
  Production: ["Audit", "Junking", "Coding"],
  "Non-Production": ["Meeting", "Client Handling", "Networking"]
};

const validationSchema = Yup.object({
  taskType: Yup.string().required("Task Type is required"),
  subTaskType: Yup.string().when("taskType", (taskType, schema) =>
    taskType ? schema.required("Sub Task Type is required") : schema.nullable()
  ),
  hoursSpent: Yup.number()
    .positive("Hours Spent must be a positive number")
    .required("Hours Spent is required")
});

const UserTaskData = () => {
  const { auth, getUserTaskData, setGetUserTaskData } = useContent();
  const token = auth?.accessToken;
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const cancelRef = React.useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const taskData = {};

  const onCloseModal = () => {
    setIsPopupOpen(false);
    onClose();
  };

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await axios.get(TASK_URL, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
        console.log("UserTaskData ->>>", response.data);
        const sortedTaskData = response.data.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setGetUserTaskData(sortedTaskData);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPostData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleEdit = (taskId) => {
    const task = getUserTaskData.find((task) => task._id === taskId);
    setSelectedTask(task);
    setIsPopupOpen(true);
    setInitialFormValues({
      taskType: task.taskType,
      subTaskType: task.subTaskType,
      hoursSpent: task.hoursSpent
    });
    onOpen();
    console.log("Edit Task ID:", taskId);
  };
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);


  const handleDelete = (taskId) => {
    setDeleteTaskId(taskId);
    setIsConfirmationOpen(true);
  };
  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false);
  };
  const handleConfirmationDelete = async () => {
    try {
      await axios.delete(`${TASK_URL}/${deleteTaskId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      setIsConfirmationOpen(false);
      setSuccessMessage("Task deleted successfully");
      // Remove the task from getUserTaskData
      const updatedTaskData = getUserTaskData.filter(
        (task) => task._id !== deleteTaskId
      );
      setGetUserTaskData(updatedTaskData);
    } catch (error) {
      console.log("Error deleting task:", error);

    }
  };

  const handleSubmit = async (values, formikBag) => {
    try {
      const response = await axios.put(
        `${TASK_URL}/${selectedTask._id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      console.log("Updated Task:", response.data);

      formikBag.resetForm();
      setSuccessMessage("Form Updated successfully!");
      const updatedTaskData = getUserTaskData.map((task) => {
        if (task._id === selectedTask._id) {
          return {
            ...task,
            taskType: values.taskType,
            subTaskType: values.subTaskType,
            hoursSpent: values.hoursSpent
          };
        }
        return task;
      });
      setGetUserTaskData(updatedTaskData);
      setTimeout(() => {
        onCloseModal(); // Close the modal after 1 second
        setSuccessMessage("");
      }, 400);
    } catch (err) {
      console.log(err);
      // Handle error here
    }
    console.log("Line 38:", values);
  };
  const [initialFormValues, setInitialFormValues] = useState({
    taskType: "",
    subTaskType: "",
    hoursSpent: ""
  });

  const [sortColumn, setSortColumn] = useState(""); // Column to sort
  const [sortDirection, setSortDirection] = useState("asc"); // Sort direction: "asc" or "desc"
  const handleSort = (column) => {
    if (column === "date" || column === "taskType") {
      if (column === sortColumn) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    }
  };
  function exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Table Data");

    // Get the table element using a ref
    const table = document.getElementById("tableId");

    // Check if the table exists
    if (!table) {
      return;
    }

    const headerStyle = {
      font: { bold: true },
      alignment: { horizontal: "center" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF00" } },
      border: { bottom: { style: "thin" } }
    };

    const cellStyle = {
      alignment: { horizontal: "center" },
      border: { bottom: { style: "thin" } }
    };

    const rows = table.getElementsByTagName("tr");
    Array.from(rows).forEach((row, rowIndex) => {
      const cells = row.getElementsByTagName("td");
      Array.from(cells).forEach((cell, cellIndex) => {
        const value = cell.innerText;
        const excelCell = worksheet.getCell(
          `${String.fromCharCode(65 + cellIndex)}${rowIndex + 1}`
        );
        excelCell.value = value;

        if (rowIndex === 0) {
          excelCell.style = headerStyle;
        } else {
          excelCell.style = cellStyle;
        }
      });
    });

    worksheet.columns.forEach((column) => {
      column.width = column.header.length < 12 ? 12 : column.header.length;
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "table_data.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  return (
    <>
      <div className="overflow-x-auto">
        <h2 className="m-8 mb-4 text-center text-2xl font-bold">
          User Task Data
        </h2>
        <div className="mx-4 my-10 sm:mx-60  sm:overflow-hidden sm:rounded-lg sm:border-b sm:border-gray-400 sm:shadow">
          <TableContainer className="min-w-full sm:rounded-lg">
            <Table className="min-w-full" id="tableId">
              <TableHeader>
                <TableRow className="text-center font-bold sm:text-base">
                  <TableCell
                    className="cursor-pointer py-5 sm:px-4"
                    onClick={() => handleSort("date")}
                  >
                    Date{""}
                    {sortColumn === "date" && (
                      <Icon
                        size={14}
                        className="ml-1"
                        name={
                          sortDirection === "asc" ? "arrow-up" : "arrow-down"
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer  sm:px-4"
                    onClick={() => handleSort("taskType")}
                  >
                    Task Type{" "}
                    {sortColumn === "taskType" && (
                      <Icon
                        size={14}
                        className="ml-1"
                        name={
                          sortDirection === "asc" ? "arrow-up" : "arrow-down"
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell className="sm:px-4">Sub Task Type</TableCell>
                  <TableCell className="sm:px-4">Hours</TableCell>
                  <TableCell className="sm:px-4">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className=" text-center">
                {getUserTaskData
                  .sort((a, b) => {
                    if (sortColumn === "date") {
                      const dateA = new Date(a.date);
                      const dateB = new Date(b.date);
                      return sortDirection === "asc"
                        ? dateA - dateB
                        : dateB - dateA;
                    } else if (sortColumn === "taskType") {
                      const taskTypeA = a.taskType.toLowerCase();
                      const taskTypeB = b.taskType.toLowerCase();
                      return sortDirection === "asc"
                        ? taskTypeA.localeCompare(taskTypeB)
                        : taskTypeB.localeCompare(taskTypeA);
                    }
                    return 0;
                  })
                  .map(({ date, _id, taskType, subTaskType, hoursSpent }) => (
                    <TableRow key={_id}>
                      <TableCell className=" sm:px-4">
                        {formatDate(date)}
                      </TableCell>
                      <TableCell className="sm:px-4">{taskType}</TableCell>
                      <TableCell className="sm:px-4">{subTaskType}</TableCell>
                      <TableCell className="sm:px-4">{hoursSpent} Hr</TableCell>
                      <TableCell className="flex items-center justify-center  sm:px-4">
                        <button
                          className="mr-2 text-indigo-600 hover:text-indigo-900 focus:outline-none md:mr-3"
                          onClick={() => handleEdit(_id)}
                        >
                          <Icon color="grey" size="20">
                            <Edit24Filled />
                          </Icon>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 focus:outline-none"
                          onClick={() => handleDelete(_id)}
                        >
                          <Icon color="grey" size="20">
                            <Delete28Regular />
                          </Icon>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <button onClick={exportToExcel}>Export to Excel</button>
        </div>

        <Modal isOpen={isOpen} onClose={onCloseModal} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Task</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <div className="flex  items-center justify-center sm:my-4 ">
                <Formik
                  className="sm:w-full"
                  initialValues={initialFormValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, handleChange, handleBlur, errors, touched }) => (
                    <Form className="mb-2 w-full rounded bg-white px-8 pb-8 pt-6 shadow-md sm:max-w-md">
                      {successMessage && (
                        <div className="mb-2 mt-2 rounded border border-green-500 bg-green-100 px-4 py-2 text-sm text-green-900">
                          {successMessage}
                        </div>
                      )}
                      <div className="mb-4">
                        <label
                          htmlFor="taskType"
                          className="mb-2 block text-sm font-bold text-gray-700"
                        >
                          Task Type:
                        </label>
                        <Field
                          as="select"
                          name="taskType"
                          id="taskType"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.taskType}
                          className={`w-full border p-2 ${
                            errors.taskType && touched.taskType
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded focus:outline-none`}
                        >
                          <option className="" value="" disabled>
                            Select a task type
                          </option>
                          {task_type.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </Field>
                        {touched.taskType && errors.taskType && (
                          <div className="mt-1 text-xs text-red-500">
                            <FaTimesCircle className="mb-1 mr-1 inline" />
                            {errors.taskType}
                          </div>
                        )}
                        {touched.taskType && !errors.taskType}
                      </div>

                      {values.taskType && (
                        <div className="mb-4">
                          <label
                            htmlFor="subTaskType"
                            className="mb-2 block text-sm font-bold text-gray-700"
                          >
                            Sub Task Type:
                          </label>
                          <Field
                            as="select"
                            name="subTaskType"
                            id="subTaskType"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.subTaskType}
                            className={`w-full border p-2 ${
                              errors.subTaskType && touched.subTaskType
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded focus:outline-none`}
                          >
                            <option value="" disabled>
                              Select a sub task type
                            </option>
                            {sub_task_type[values.taskType] &&
                              sub_task_type[values.taskType].map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                          </Field>
                          {touched.subTaskType && errors.subTaskType && (
                            <div className="mt-1 text-xs text-red-500">
                              <FaTimesCircle className="mb-1 mr-1 inline" />
                              {errors.subTaskType}
                            </div>
                          )}
                          {touched.subTaskType && !errors.subTaskType}
                        </div>
                      )}

                      <div className="mb-4">
                        <label
                          htmlFor="hoursSpent"
                          className="mb-2 block text-sm font-bold text-gray-700"
                        >
                          Hours Spent:
                        </label>
                        <Field
                          type="number"
                          id="hoursSpent"
                          name="hoursSpent"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.hoursSpent}
                          className={`w-full border p-2 ${
                            errors.hoursSpent && touched.hoursSpent
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded focus:outline-none`}
                        />
                        {touched.hoursSpent && errors.hoursSpent && (
                          <div className="mt-1 text-xs text-red-500">
                            <FaTimesCircle className="mb-1 mr-1 inline" />
                            {errors.hoursSpent}
                          </div>
                        )}
                        {touched.hoursSpent && !errors.hoursSpent}
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          type="submit"
                          colorScheme="teal"
                          className={`w-full rounded bg-red-500 px-4 py-2 text-white ${
                            Object.keys(errors).length > 0 || !values.taskType
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          } hover:bg-red-600`}
                          disabled={
                            Object.keys(errors).length > 0 ||
                            !values.taskType ||
                            (values.taskType && !values.subTaskType) ||
                            !values.hoursSpent
                          }
                        >
                          Update
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
      <AlertDialog
        isOpen={isConfirmationOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleConfirmationClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Task
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleConfirmationClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={handleConfirmationDelete}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {successMessage && (
        <Box mt={4} p={2} bg="green.100" color="green.800" rounded="md">
          {successMessage}
        </Box>
      )}
    </>
  );
};

export default UserTaskData;