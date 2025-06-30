// src/controllers/notificationController.js
import prisma from '../lib/prisma.js'

export const sendNotification = async (req, res) => {
  try {
    const { title, message, type = 'info' } = req.body

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" })
    }

    const notification = await prisma.notification.create({
      data: { title, message, type }
    })

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export const getNotifications = async (req, res) => {
  try {
    const { isRead, limit, type } = req.query
    
    const notifications = await prisma.notification.findMany({
      where: {
        isRead: isRead ? isRead === 'true' : undefined,
        type: type || undefined
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined
    })

    res.json({
      success: true,
      data: notifications
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params

    await prisma.notification.delete({
      where: { id: notificationId }
    })

    res.json({
      success: true,
      message: "Notification deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}