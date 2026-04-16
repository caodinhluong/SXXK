'use strict';

const currencyService = require('../services/tiente.service');

const createCurrency = async (req, res) => {
  try {
    const { ma_tt, ten_tt } = req.body;
    const result = await currencyService.createCurrency(ma_tt, ten_tt);

    res.status(201).json({
      success: true,
      message: "Tạo tiền tệ thành công",
      data: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllCurrencies = async (req, res) => {
  try {
    // Lấy params phân trang từ query string
    const { page = 1, limit = 100, search = '' } = req.query;
    
    const result = await currencyService.getAllCurrencies({
      page: Number(page),
      limit: Number(limit),
      search
    });
    
    res.status(200).json({ 
      success: true, 
      ...result  // { data: [...], pagination: {...} }
    });
  } catch (error) {
    console.error('Error in getAllCurrencies:', error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const getCurrencyById = async (req, res) => {
  try {
    const { id_tt } = req.params;
    const result = await currencyService.getCurrencyById(id_tt);

    if (!result) {
      return res.status(404).json({ success: false, message: "Không tìm thấy" });
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const updateCurrency = async (req, res) => {
  try {
    const { id_tt } = req.params;
    const { ma_tt, ten_tt } = req.body;

    if (isNaN(parseInt(id_tt))) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }

    if (!ma_tt && !ten_tt) {
      return res.status(400).json({ success: false, message: "Cần cung cấp ít nhất một trường để cập nhật" });
    }

    const result = await currencyService.updateCurrency(id_tt, { ma_tt, ten_tt });

    res.status(200).json({
      success: true,
      message: "Cập nhật tiền tệ thành công",
      data: result
    });
  } catch (error) {
    console.error("Update Currency Error:", error.message);
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("đã tồn tại")) {
      return res.status(409).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật" });
  }
};


module.exports = {
    createCurrency,
    getAllCurrencies,
    getCurrencyById,
    updateCurrency
};