'use client'
// require('dotenv').config();
import Image from "next/image";
import {useState, useEffect} from 'react'
import {firestore} from '@/firebase'
import { Box, Typography, Modal, Stack, TextField, Button } from "@mui/material";
import { query, collection, getDocs, deleteDoc, getDoc, setDoc, doc } from "firebase/firestore";
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

export default function Home() {

  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const[itemName, setItemName] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
    
  }
  const removeForever = async(item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()){
      await deleteDoc(docRef)
    }
    await updateInventory()

  }

  const removeItem = async(item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()){
      const {quantity} = docSnap.data()
      if (quantity === 1){
        await deleteDoc(docRef)
      }else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }
    await updateInventory()
  }

  const addItem = async(item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
    }else {
      await setDoc(docRef, {quantity: 1})
    }
    await updateInventory()
  }
  //for modal 
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  
  useEffect(() => { 
    updateInventory()
  },[])

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      gap={2} 
      flexDirection="column"
      >
      <Modal open={open} onClose={handleClose}>
      <Box 
        position="absolute" 
        top="50%" 
        left="50%"
        width={400}
        bgcolor="white"
        border="2px solid #000"
        boxShadow={24}
        p={4}
        display="flex"
        flexDirection="column"
        gap={3}
        sx={{

          transform: 'translate(-50%,-50%)',
        }}
        
        >

        <Typography  variant="h6"> Add Items</Typography>

        <Stack width="100%" direction ="row" spacing={2}>
          <TextField
          variant="outlined"
          fullWidth
          value={itemName}
          onChange={(e) =>{
            setItemName(e.target.value)

          }}
          />

          <Button 
            variant="outlined" 
            onClick={() => {
              addItem(itemName) // adding the item name to the database
              setItemName('') // emplty the text field
              handleClose() // close the modal
            }}
          >Add</Button>
        </Stack>
      </Box>

      </Modal>
      <Stack width="90vw" direction="row" marginBottom={10} display="flex" justifyContent="center">
        <Typography variant="h1">INVENTORY</Typography>
        
      </Stack>

      <Box border="1px solid #333">
        <Box
          width="800px"
          height="100px"
          bgcolor="#ADD8F6"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={10}
          >
          <Typography variant="h2" color="#333"  > Inventory Items</Typography>
          <Button variant="contained" 
         onClick={() => {
          handleOpen()
        }}> Add New Item
        </Button>
        </Box>
      

        <Stack width="800px" height="500px" spacing={2} overflow="auto">
          {
            inventory.map(({name, quantity}) =>(
              <Box key={name} width="100%" minHight="150px" display="flex"
              alignItems="center" justifyContent="space-between" bgcolor="#f0f0f0" padding={5}
              >
                <Typography
                variant="h3"
                color="#333"
                textAlign="center"
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                
                <Typography
                  variant="h3"
                  color="#333"
                  textAlign="center"

                  >
                  {quantity}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={() =>{
                    addItem(name)
                    }}
                    >
                    Add
                  </Button>
                  <Button variant="contained" onClick={() =>{
                    removeItem(name)
                    }}
                    >
                    Remove
                  </Button>
                  <DeleteRoundedIcon onClick={() =>{
                    removeForever(name)
                    }}/>
                </Stack>


              </Box>
            ))
          }
        
        



        </Stack>

      </Box>
     


    </Box>
    
  
  
  
  
  
  )
  
}
