from .data_manager import read_data, write_data, USERS_FILE

class UserModel:
    @staticmethod
    def get_users():
        return read_data(USERS_FILE)

    @staticmethod
    def authenticate(username, password):
        users = read_data(USERS_FILE)
        for user in users:
            if user['username'] == username and user['password'] == password:
                return user
        return None