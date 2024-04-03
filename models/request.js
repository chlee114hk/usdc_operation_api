// Copyright 2024 vincentlee
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

module.exports = (sequelize, Sequelize) => {
    const Request = sequelize.define(
        "Request", {
            amount: {
                type: Sequelize.FLOAT,
                allowNull: false
            },
            wallet_address: {
                type: Sequelize.STRING,
                allowNull: false
            },
            from_block: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            allow_redeem: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM("pending", "processing", "completed", "cancelled"),
                defaultValue: "pending",
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
            }
        },
        {version: true}
    );
    
    Request.associate = (models) => {
        Request.belongsTo(
            models.Account,
            { 
                foreignKey: 'account_id',
                targetKey: 'id'
            }
        );
    };

    return Request
}