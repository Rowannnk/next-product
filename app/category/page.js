"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { DataGrid } from "@mui/x-data-grid";
import { Button, TextField, Container, Grid } from "@mui/material";

export default function Home() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  const [categoryList, setCategoryList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  async function fetchCategory() {
    const response = await fetch(`${API_BASE}/category`);
    const data = await response.json();
    setCategoryList(data);
  }

  useEffect(() => {
    fetchCategory();
  }, []);

  async function handleCategoryFormSubmit(data) {
    if (editMode) {
      // Updating a category
      await fetch(`${API_BASE}/category`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      stopEditMode();
      fetchCategory();
      return;
    }

    // Creating a new category
    await fetch(`${API_BASE}/category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    fetchCategory();
  }

  async function handleDelete(id) {
    await fetch(`${API_BASE}/category`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    fetchCategory();
  }

  function startEditMode(category) {
    reset(category);
    setEditMode(true);
    setEditingCategory(category);
  }

  function stopEditMode() {
    reset({
      name: "",
      order: "",
    });
    setEditMode(false);
    setEditingCategory(null);
  }

  const columns = [
    { field: "name", headerName: "Category Name", flex: 1 },
    { field: "order", headerName: "Order", type: "number", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => startEditMode(params.row)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </>
      ),
      flex: 1,
    },
  ];

  const rows = categoryList.map((category) => ({
    id: category._id,
    name: category.name,
    order: category.order,
  }));

  return (
    <Container>
      <form onSubmit={handleSubmit(handleCategoryFormSubmit)}>
        <Grid container spacing={2} marginTop={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Category Name"
              variant="outlined"
              fullWidth
              {...register("name", { required: true })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Order"
              type="number"
              variant="outlined"
              fullWidth
              {...register("order", { required: true })}
            />
          </Grid>
          <Grid item xs={12} textAlign="right">
            {editMode ? (
              <>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{ marginRight: 8 }}
                >
                  Update
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  color="default"
                  onClick={stopEditMode}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="submit" variant="contained" color="success">
                Add
              </Button>
            )}
          </Grid>
        </Grid>
      </form>
      <div style={{ height: 400, width: "100%", marginTop: 20 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
        />
      </div>
    </Container>
  );
}
