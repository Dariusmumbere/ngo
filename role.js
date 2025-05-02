const firebaseConfig = {
        apiKey: "AIzaSyD3MRQClXo8PLY6ru636Rc3o2VpxvdmLKg",
        authDomain: "rcdnet.firebaseapp.com",
        projectId: "rcdnet",
        storageBucket: "rcdnet.firebasestorage.app",
        messagingSenderId: "655017761227",
        appId: "1:655017761227:web:5a253c0328c5b67464be4e"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Current user data
    let currentUser = null;

    // Check auth state
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            currentUser = user;
            checkUserRole(user.uid);
        } else {
            // No user is signed in
            currentUser = null;
            showLoginModal();
        }
    });

    // Login form handler
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            document.getElementById('loginError').style.display = 'none';
        } catch (error) {
            document.getElementById('loginError').textContent = error.message;
            document.getElementById('loginError').style.display = 'block';
        }
    });

    // Create account form handler (only for director)
    document.getElementById('createAccountForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('newUserEmail').value;
        const password = document.getElementById('newUserPassword').value;
        const role = document.getElementById('newUserRole').value;
        const name = document.getElementById('newUserName').value;
        
        try {
            // First create the user in Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Then store additional user data in Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                email: email,
                role: role,
                name: name,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Hide the create account modal
            document.getElementById('createAccountModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'block';
        } catch (error) {
            document.getElementById('createAccountError').textContent = error.message;
            document.getElementById('createAccountError').style.display = 'block';
        }
    });

    // Check user role and show appropriate UI
    async function checkUserRole(uid) {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Update UI with user info
            document.querySelector('.user-name').textContent = userData.name;
            document.querySelector('.user-role').textContent = userData.role;
            
            // Hide login modal
            document.getElementById('loginModal').style.display = 'none';
            
            // Show create account option only for director
            if (userData.role === 'director') {
                document.getElementById('createAccountSection').style.display = 'block';
                document.getElementById('showCreateAccount').addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById('loginModal').style.display = 'none';
                    document.getElementById('createAccountModal').style.display = 'block';
                });
            }
            
            // Show the main content
            document.querySelector('.container').style.display = 'flex';
        } else {
            // User document doesn't exist - sign them out
            await auth.signOut();
        }
    }

    // Show login modal and hide main content
    function showLoginModal() {
        document.getElementById('loginModal').style.display = 'block';
        document.querySelector('.container').style.display = 'none';
    }

    // Cancel create account
    document.getElementById('cancelCreateAccount').addEventListener('click', () => {
        document.getElementById('createAccountModal').style.display = 'none';
        document.getElementById('loginModal').style.display = 'block';
    });

    // Logout functionality (add this to your existing logout button or create one)
    function logout() {
        auth.signOut();
    }

    
