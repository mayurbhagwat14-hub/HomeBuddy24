import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StoreProductsList from './StoreProductsList';
import AddEditProduct from './AddEditProduct';

const StoreProductsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<StoreProductsList />} />
      <Route path="/add" element={<AddEditProduct />} />
      <Route path="/:id/edit" element={<AddEditProduct />} />
    </Routes>
  );
};

export default StoreProductsModule;
